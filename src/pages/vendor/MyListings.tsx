import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  MapPin,
  Pencil,
  Trash2,
  Zap,
  BarChart2,
  Lock,
  Loader2,
  AlertCircle,
  LayoutList,
} from "lucide-react";
import {
  BottomNavBar,
  SectionLabel,
  Toast,
  EditListingModal,
  VENDOR_NAV_ITEMS,
} from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import { getMyListings, deleteListing, type MyListing } from "../../services/listings";
import { getSubscriptionStatus } from "../../services/payment";
import { useListingPerformance } from "../../hooks/useAnalytics";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const ListingSkeleton = () => (
  <div className="bg-[#00C9A7]/20 rounded-2xl p-4 flex flex-col gap-3 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="h-5 w-40 bg-white/50 rounded" />
        <div className="h-3 w-28 bg-white/30 rounded" />
      </div>
      <div className="h-5 w-12 bg-white/40 rounded-full" />
    </div>
    <div className="bg-white/60 rounded-xl p-3 flex gap-6">
      <div className="flex flex-col gap-1">
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-5 w-10 bg-gray-200 rounded" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="h-3 w-12 bg-gray-200 rounded" />
        <div className="h-5 w-8 bg-gray-200 rounded" />
      </div>
    </div>
    <div className="flex gap-2">
      <div className="h-8 flex-1 bg-white/40 rounded-xl" />
      <div className="h-8 flex-1 bg-[#F5B800]/40 rounded-xl" />
      <div className="h-8 flex-1 bg-white/40 rounded-xl" />
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <div className="flex flex-col items-center gap-4 py-14 text-center bg-white rounded-2xl border border-gray-100 px-6">
    <div className="w-16 h-16 rounded-2xl bg-[#F5F5F0] flex items-center justify-center">
      <LayoutList className="w-8 h-8 text-[#A4A7A7]" />
    </div>
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-bold text-[#1C1B1B] m-0">No listings yet</p>
      <p className="text-xs text-[#747878] m-0 leading-relaxed max-w-56">
        Create your first listing so commuters near transit hubs can find your business.
      </p>
    </div>
    <button
      type="button"
      id="empty-create-listing-btn"
      onClick={onAdd}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5B800] text-[#1C1B1B] font-semibold text-sm hover:bg-[#FFCA28] active:scale-[0.97] transition-all"
    >
      <Plus className="w-4 h-4" />
      Create Your First Listing
    </button>
  </div>
);

// ─── Listing Card ─────────────────────────────────────────────────────────────

interface ListingCardProps {
  listing: MyListing;
  viewsCount: number;
  isPremium: boolean;
  onEdit: (id: string) => void;
  onBoost: (id: string) => void;
  onAnalytics: (id: string) => void;
  onDelete: (id: string) => void;
}

const ListingCard = ({
  listing,
  viewsCount,
  isPremium,
  onEdit,
  onBoost,
  onAnalytics,
  onDelete,
}: ListingCardProps) => {
  const locationLabel = `${listing.location.lat.toFixed(4)}, ${listing.location.lng.toFixed(4)}`;

  return (
    <div className="bg-[#00C9A7] rounded-2xl p-4 flex flex-col gap-3">
      {/* Card header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <h3 className="text-white font-bold text-base m-0 leading-tight truncate">
            {listing.businessName}
          </h3>
          <div className="flex items-center gap-1 text-white/70 text-xs">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{listing.category} · {locationLabel}</span>
          </div>
        </div>
        {/* LIVE badge */}
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00875A] text-white text-[10px] font-bold shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          LIVE
        </span>
      </div>

      {/* Stats chip — wired to real GET /api/analytics/listings response */}
      <div className="bg-white rounded-xl px-4 py-2.5 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-[#747878] uppercase tracking-wider">
            Views (7D)
          </span>
          <span className="text-lg font-extrabold text-[#1C1B1B]">
            {viewsCount.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-[#747878] uppercase tracking-wider">
            Status
          </span>
          <span className="text-xs font-bold text-[#00875A] flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00875A] animate-pulse" />
            Active
          </span>
        </div>

        {/* ── LEGACY SPEC (PRESERVED): Clicks Metric ──
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-[#747878] uppercase tracking-wider">
            Clicks
          </span>
          <span className="text-lg font-extrabold text-[#1C1B1B]">--</span>
        </div>
        ──────────────────────────────────────────── */}
      </div>

      {/* Action buttons — Edit and Delete require active subscription on backend.
          Visible-but-disabled with upgrade treatment when not premium, matching VendorDashboard pattern */}
      <div className="flex gap-2">
        {/* Edit */}
        <button
          type="button"
          id={`edit-listing-${listing._id}`}
          onClick={() => onEdit(listing._id)}
          className={`
            flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
            text-xs font-semibold transition-all active:scale-[0.97] border
            ${isPremium
              ? "bg-white text-[#1C1B1B] border-transparent hover:bg-gray-50"
              : "bg-white/60 text-[#747878] border-white/30"
            }
          `}
          aria-label={isPremium ? "Edit listing" : "Upgrade to edit listing"}
        >
          {isPremium
            ? <Pencil className="w-3.5 h-3.5" />
            : <Lock className="w-3.5 h-3.5" />
          }
          Edit
        </button>

        {/* Boost — premium feature, always upgrade-gated */}
        <button
          type="button"
          id={`boost-listing-${listing._id}`}
          onClick={() => onBoost(listing._id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-[#F5B800] text-[#1C1B1B] hover:bg-[#FFCA28] active:scale-[0.97] transition-all"
          aria-label="Boost listing"
        >
          <Zap className="w-3.5 h-3.5" />
          Boost
        </button>

        {/* Analytics */}
        <button
          type="button"
          id={`analytics-listing-${listing._id}`}
          onClick={() => onAnalytics(listing._id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-white text-[#1C1B1B] hover:bg-gray-50 active:scale-[0.97] transition-all"
          aria-label="View analytics"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Analytics
        </button>

        {/* Delete */}
        <button
          type="button"
          id={`delete-listing-${listing._id}`}
          onClick={() => onDelete(listing._id)}
          className={`
            w-9 flex items-center justify-center rounded-xl transition-all active:scale-[0.97] border
            ${isPremium
              ? "bg-white/70 text-[#D32F2F] border-transparent hover:bg-white"
              : "bg-white/40 text-[#747878] border-white/20"
            }
          `}
          aria-label={isPremium ? "Delete listing" : "Upgrade to delete listing"}
        >
          {isPremium
            ? <Trash2 className="w-3.5 h-3.5" />
            : <Lock className="w-3.5 h-3.5" />
          }
        </button>
      </div>
    </div>
  );
};

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

interface DeleteModalProps {
  listingName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteModal = ({ listingName, onConfirm, onCancel, isDeleting }: DeleteModalProps) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="delete-modal-title"
    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={onCancel}
  >
    <div
      className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl flex flex-col gap-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] flex items-center justify-center shrink-0">
          <Trash2 className="w-5 h-5 text-[#D32F2F]" />
        </div>
        <div>
          <h3 id="delete-modal-title" className="text-base font-bold text-[#1C1B1B] m-0">
            Delete Listing
          </h3>
          <p className="text-xs text-[#747878] m-0 mt-0.5 truncate max-w-[200px]">
            {listingName}
          </p>
        </div>
      </div>
      <p className="text-sm text-[#444748] m-0 leading-relaxed">
        This listing will be permanently removed. Commuters will no longer see it near transit hubs.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#444748] hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          id="confirm-delete-btn"
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 py-2.5 rounded-xl bg-[#D32F2F] text-white text-sm font-semibold hover:bg-[#B71C1C] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * MyListings — Vendor page to view, manage, and act on all their business listings.
 *
 * Route: /vendor/listings  (protected, role: "business")
 * Dev alias: /dev/my-listings
 *
 * Data wiring (Live API Mode):
 *  LIVE:  listings array — GET /api/listings/my (listing.routes.js:32-36, listing.controller.js:123-170, app.js:194)
 *  LIVE:  isPremium / subscription — GET /api/subscription/status (subscription.routes.js, app.js:201-205)
 *  STATIC (placeholder): views/clicks stats — backend GET /api/listings/my does not return analytics
 *    TODO: replace "--" with real view/click data when GET /api/analytics/listings/:id is available
 *  STATIC: location display label — backend returns only { lat, lng }, no reverse-geocoded area name
 *    TODO: show human-readable area when backend adds reverse geocode to listing response
 *
 * Edit/Delete:
 *  Both require requireActiveSubscription middleware (listing.routes.js:54, 62).
 *  When not premium: buttons visible but show Lock icon and fire toast + navigate to /vendor/upgrade
 *  (matching the handleLockedAction pattern from VendorDashboard.tsx:138-143).
 */
const MyListings = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MyListing | null>(null);
  const [editingListing, setEditingListing] = useState<MyListing | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // ── Live: all my listings — GET /api/listings/my ─────────────────────────
  const {
    data: listingsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["listings", "my"],
    queryFn: getMyListings,
    enabled: !!session?.token,
  });

  const listings = listingsData?.listings ?? [];

  // ── Live: per-listing view performance — GET /api/analytics/listings ─────
  const { data: performanceData } = useListingPerformance(7);
  const listingViewsMap = new Map<string, number>(
    (performanceData || []).map((item) => [item.listingId, item.views])
  );

  // ── Live: subscription status — GET /api/subscription/status ─────────────
  const { data: subData } = useQuery({
    queryKey: ["business", "subscription"],
    queryFn: getSubscriptionStatus,
    enabled: !!session?.token,
  });

  const isPremium =
    subData?.subscription?.status === "active" ||
    subData?.subscription?.status === "trial";

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleEdit = (id: string) => {
    if (!isPremium) {
      showToast("Edit Listing is a premium feature.");
      navigate("/vendor/upgrade");
      return;
    }
    const target = listings.find((l) => l._id === id) ?? null;
    if (target) {
      setEditingListing(target);
    }
  };

  const handleBoost = (_id: string) => {
    // Boost is always upgrade-gated — no endpoint exists yet
    // TODO: POST /api/listings/:id/boost when backend implements it
    showToast("Boost Listing is a premium feature.");
    navigate("/vendor/upgrade");
  };

  const handleAnalytics = (_id: string) => {
    // Navigate to the vendor analytics page
    // TODO: pass listing ID to analytics page when per-listing view is implemented
    navigate("/vendor/analytics");
  };

  const handleDeleteRequest = (id: string) => {
    if (!isPremium) {
      showToast("Delete Listing is a premium feature.");
      navigate("/vendor/upgrade");
      return;
    }
    const target = listings.find((l) => l._id === id) ?? null;
    setDeleteTarget(target);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      // DELETE /api/listings/:listingId (listing.routes.js:59-64, listing.controller.js:581-624)
      // Requires: protect + requireActiveSubscription middleware
      await deleteListing(deleteTarget._id);
      showToast("Listing deleted successfully.");
      await refetch();
    } catch {
      showToast("Failed to delete listing. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F0]">
      {/* ── Navbar (untouched — VENDOR_NAV_ITEMS, no changes) ────────── */}
      <BottomNavBar items={VENDOR_NAV_ITEMS} />

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <main
        id="my-listings-main"
        className="flex-1 w-full mx-auto pt-16"
        style={{ maxWidth: "min(100%, 68rem)" }}
        aria-label="My listings content"
      >
        <div className="flex flex-col gap-5 px-4 sm:px-6 pt-4 pb-24">

          {/* ── Header ───────────────────────────────────────────────── */}
          <div className="flex items-center justify-between py-1">
            <div>
              <h1 className="text-lg font-bold text-[#1C1B1B] m-0 leading-tight">
                My Listings
              </h1>
              <p className="text-xs text-[#747878] m-0 mt-0.5">
                Manage your business presence
              </p>
            </div>
          </div>

          {/* ── Loading ───────────────────────────────────────────────── */}
          {isLoading && (
            <div className="flex flex-col gap-4">
              <ListingSkeleton />
              <ListingSkeleton />
            </div>
          )}

          {/* ── Error ─────────────────────────────────────────────────── */}
          {isError && (
            <div className="flex flex-col items-center gap-3 py-10 text-center bg-white rounded-2xl border border-gray-100 px-6">
              <AlertCircle className="w-8 h-8 text-[#A4A7A7]" />
              <div>
                <p className="text-sm font-bold text-[#1C1B1B] m-0">
                  Could not load listings
                </p>
                <p className="text-xs text-[#747878] m-0 mt-0.5">
                  Check your connection and try again.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void refetch()}
                className="px-4 py-2 rounded-xl bg-[#F5B800] text-[#1C1B1B] text-sm font-semibold hover:bg-[#FFCA28] active:scale-[0.97] transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Loaded state ─────────────────────────────────────────── */}
          {!isLoading && !isError && (
            <>
              {listings.length === 0 ? (
                <EmptyState onAdd={() => navigate("/vendor/create-listing")} />
              ) : (
                <>
                  {/* Active Listings section */}
                  <div className="flex flex-col gap-1">
                    <SectionLabel>Active Listings</SectionLabel>
                    <div className="flex flex-col gap-4 mt-2">
                      {listings.map((listing) => (
                        <ListingCard
                          key={listing._id}
                          listing={listing}
                          viewsCount={listingViewsMap.get(listing._id) ?? 0}
                          isPremium={isPremium}
                          onEdit={handleEdit}
                          onBoost={handleBoost}
                          onAnalytics={handleAnalytics}
                          onDelete={handleDeleteRequest}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── FAB — Create New Listing ──────────────────────────────────── */}
      <button
        type="button"
        id="fab-create-listing"
        onClick={() => navigate("/vendor/create-listing")}
        aria-label="Create new listing"
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-[#F5B800] text-[#1C1B1B] shadow-lg flex items-center justify-center hover:bg-[#FFCA28] active:scale-95 transition-all z-40"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {/* ── Edit Listing Modal ────────────────────────────────────────── */}
      {editingListing && (
        <EditListingModal
          listing={editingListing}
          isOpen={!!editingListing}
          onClose={() => setEditingListing(null)}
          onSuccess={() => {
            setEditingListing(null);
            showToast("Listing updated successfully!");
            void refetch();
          }}
        />
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────────── */}
      {deleteTarget && (
        <DeleteModal
          listingName={deleteTarget.businessName}
          onConfirm={() => void handleDeleteConfirm()}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      <Toast message={toastMsg} />
    </div>
  );
};

export default MyListings;
