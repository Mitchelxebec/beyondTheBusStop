import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, BarChart2, Bus } from "lucide-react";
import {
  BottomNavBar,
  SectionLabel,
  PrimaryButton,
  SecondaryButton,
  CreateRouteModal,
  RouteCard,
  Toast,
  VENDOR_NAV_ITEMS,
} from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import { useRoutes } from "../../hooks/useRoutes";
import type { Route } from "../../types/routes";

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Shared Route Management & Route Network screen.
 * Accessible to both Commuter and Business/Vendor users.
 */
const VendorRoutes = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const isBusiness = session?.role === "business";

  const displayName = isBusiness
    ? session?.user?.businessName || session?.user?.fullName || "Transit Operator"
    : session?.user?.fullName || "Commuter";

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Live Query for all routes
  const { data: allRoutes = [], isLoading, isError } = useRoutes();
  const currentUserId = session?.user?._id || session?.user?.id;
  const userRoutes = allRoutes.filter((r) => r.createdBy === currentUserId);
  const displayedRoutes = allRoutes;

  return (
    <div className="flex flex-col min-h-dvh bg-[#FDFAF8]">
      {/* ── Navbar ───────────────────────────────────────────────────── */}
      <BottomNavBar items={isBusiness ? VENDOR_NAV_ITEMS : undefined} />

      {/* ── Main Container ────────────────────────────────────────────── */}
      <main
        id="routes-network-main"
        className="flex-1 w-full mx-auto pt-16"
        style={{ maxWidth: "min(100%, 42rem)" }}
        aria-label="Route Management & Network Content"
      >
        <div className="flex flex-col gap-6 px-4 sm:px-6 pt-8 pb-12">
          {/* Header & Status Tag */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#59DBC7]">
                Route Network
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#79F7E3]/30 text-[#005047]">
                {isBusiness ? "CORRIDOR OPERATOR" : "COMMUTER NETWORK"}
              </span>
            </div>
            <h1 className="text-[#1C1B1B] text-xl sm:text-2xl font-semibold m-0">
              Transit Routes for {displayName}
            </h1>
            <p className="text-[#444748] text-sm font-normal m-0">
              {isBusiness
                ? "Create, update, and manage official transit corridors and fare estimates."
                : "Explore verified community routes or create new transit corridors for fellow commuters."}
            </p>
          </section>

          {/* Key Metrics Bento */}
          <section className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-xl shadow-xs border border-neutral-100 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#444748]">
                  Total Routes
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#79F7E3]/20 flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-[#005047]" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[#1C1B1B]">
                  {displayedRoutes.length}
                </span>
                <span className="block text-[11px] text-[#005047] font-medium mt-0.5">
                  Active in network
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-xs border border-neutral-100 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#444748]">
                  Your Contributions
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#FFC72C]/20 flex items-center justify-center">
                  <Bus className="w-4 h-4 text-[#4A3B00]" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#1C1B1B]">
                    {userRoutes.length}
                  </span>
                  <span className="text-xs text-[#444748]">created by you</span>
                </div>
                <span className="block text-[11px] text-[#444748] font-normal mt-0.5">
                  Verified routes
                </span>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="flex flex-col gap-3">
            <SectionLabel variant="page">Quick Actions</SectionLabel>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PrimaryButton
                id="create-route-btn"
                onClick={() => setShowCreateModal(true)}
                width="full"
              >
                <Plus className="w-4.5 h-4.5" />
                Create New Route
              </PrimaryButton>

              <SecondaryButton
                id="view-search-routes-btn"
                onClick={() => navigate("/search")}
                width="full"
              >
                Search Destination Corridors
              </SecondaryButton>
            </div>
          </section>

          {/* Active Routes */}
          <section className="flex flex-col gap-3">
            <SectionLabel variant="page">
              Active Transit Corridors ({displayedRoutes.length})
            </SectionLabel>

            {isLoading && (
              <p className="text-[#444748] text-sm text-center py-8">
                Loading routes…
              </p>
            )}

            {!isLoading && isError && (
              <p className="text-red-500 text-sm text-center py-8">
                Failed to load routes. Please try again.
              </p>
            )}

            {!isLoading && !isError && displayedRoutes.length === 0 && (
              <div className="bg-white rounded-xl p-8 text-center border border-neutral-100 flex flex-col items-center gap-3">
                <p className="text-[#444748] text-sm m-0">
                  No transit routes created yet in the network.
                </p>
                <PrimaryButton
                  onClick={() => setShowCreateModal(true)}
                  width="auto"
                >
                  Add The First Route
                </PrimaryButton>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {displayedRoutes.map((route: Route) => (
                <RouteCard
                  key={route._id}
                  route={route}
                  badgeText={route.createdBy === currentUserId ? "Created by you" : undefined}
                  onSelect={(r) => navigate(`/routes/${r._id || r.id}`)}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* ── Reusable Create Route Modal ─────────────────────────────── */}
      <CreateRouteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          showToast("Route created and published successfully!");
        }}
      />

      {/* ── Toast Notification ───────────────────────────────────────── */}
      <Toast message={toastMessage} />
    </div>
  );
};

export default VendorRoutes;
