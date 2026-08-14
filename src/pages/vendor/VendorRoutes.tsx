import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  BottomNavBar,
  SectionLabel,
  PrimaryButton,
  SecondaryButton,
  TextInput,
} from "../../components";
import type { NavItem } from "../../components/BottomNavBar";
import { useAuth } from "../../contexts/AuthContext";
import { getAllRoutes, createRoute } from "../../services/routes";
import type { Route, VehicleType, CreateRoutePayload } from "../../types/routes";

// ─── Icons ──────────────────────────────────────────────────────────────────────

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M9 3.75V14.25M3.75 9H14.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
    <path d="M2 5.5H9M9 5.5L6 2.5M9 5.5L6 8.5" stroke="#C4C7C7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BusIcon = () => (
  <svg width="16" height="19" viewBox="0 0 16 19" fill="none" aria-hidden="true">
    <rect x="1" y="2" width="14" height="13" rx="2" fill="#6F5400" />
    <rect x="3" y="4" width="4" height="3" rx="0.5" fill="#FFC72C" />
    <rect x="9" y="4" width="4" height="3" rx="0.5" fill="#FFC72C" />
    <rect x="1" y="11" width="14" height="2" fill="#6F5400" />
    <circle cx="4" cy="16" r="2" fill="#6F5400" />
    <circle cx="12" cy="16" r="2" fill="#6F5400" />
  </svg>
);

const ChartBarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M3 17V10M8 17V4M13 17V13M18 17V7" stroke="#005047" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M5 5L15 15M5 15L15 5" stroke="#444748" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// Nav icons
const HomeNavIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 18" fill="currentColor" aria-hidden="true">
    <path d="M8 1L15 7V17H10V12H6V17H1V7L8 1Z" />
  </svg>
);
const RoutesNavIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="3" cy="3" r="2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="15" cy="15" r="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M3 5V10C3 12.2 4.8 14 7 14H11C13.2 14 15 12.2 15 10V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const ShareNavIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 20" fill="none" aria-hidden="true">
    <circle cx="15" cy="3" r="2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="3" cy="10" r="2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="15" cy="17" r="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M5 8.8L13 4.2M5 11.2L13 15.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const ProfileNavIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2 19C2 15.1 5.6 12 10 12C14.4 12 18 15.1 18 19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const VENDOR_NAV_ITEMS: NavItem[] = [
  { label: "Home", path: "/vendor/home", icon: <HomeNavIcon /> },
  { label: "Routes", path: "/vendor/routes", icon: <RoutesNavIcon /> },
  { label: "Share", path: "/share", icon: <ShareNavIcon /> },
  { label: "Profile", path: "/profile", icon: <ProfileNavIcon /> },
];

// ─── Component ─────────────────────────────────────────────────────────────────

const VendorRoutes = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const businessName =
    session?.user?.businessName || session?.user?.fullName || "Transit Operator";

  // Modal & Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateRoutePayload>({
    origin: "",
    destination: "",
    vehicleType: "bus",
    fareLow: 200,
    fareHigh: 500,
  });
  const [formError, setFormError] = useState("");

  // Live Query
  const { data: routesData, isLoading, isError } = useQuery({
    queryKey: ["routes"],
    queryFn: getAllRoutes,
  });

  // Filter routes created by this business user (or all routes as fallback)
  const allRoutes = routesData?.routes ?? [];
  const vendorRoutes = allRoutes.filter(
    (r) => r.createdBy === session?.user?._id || r.createdBy === session?.user?.id
  );
  const displayedRoutes = vendorRoutes.length > 0 ? vendorRoutes : allRoutes;

  // Mutation to create route (Real backend API endpoint: POST /api/routes/create)
  const createRouteMutation = useMutation({
    mutationFn: createRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      setShowCreateModal(false);
      setFormData({
        origin: "",
        destination: "",
        vehicleType: "bus",
        fareLow: 200,
        fareHigh: 500,
      });
      setFormError("");
    },
    onError: (err: Error) => {
      setFormError(err.message || "Failed to create route");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.origin.trim() || !formData.destination.trim()) {
      setFormError("Please enter origin and destination");
      return;
    }
    if (formData.fareLow <= 0 || formData.fareHigh < formData.fareLow) {
      setFormError("Please enter valid low and high fare values");
      return;
    }
    createRouteMutation.mutate(formData);
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#FDFAF8]">
      {/* ── Navbar ───────────────────────────────────────────────────── */}
      <BottomNavBar items={VENDOR_NAV_ITEMS} />

      {/* ── Main Container ────────────────────────────────────────────── */}
      <main
        id="vendor-routes-main"
        className="flex-1 w-full mx-auto pt-16"
        style={{ maxWidth: "min(100%, 42rem)" }}
        aria-label="Vendor Route Management Content"
      >
        <div className="flex flex-col gap-6 px-4 sm:px-6 pt-8 pb-12">
          {/* Header & Status Tag */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#59DBC7]">
                Route Management
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#79F7E3]/30 text-[#005047]">
                CORRIDOR OPERATOR
              </span>
            </div>
            <h1 className="text-[#1C1B1B] text-xl sm:text-2xl font-semibold m-0">
              Transit Routes for {businessName}
            </h1>
            <p className="text-[#444748] text-sm font-normal m-0">
              Create, update, and manage official transit corridors and fare estimates.
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
                  <ChartBarIcon />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-[#1C1B1B]">
                  {displayedRoutes.length}
                </span>
                <span className="block text-[11px] text-[#005047] font-medium mt-0.5">
                  Active listings
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-xs border border-neutral-100 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#444748]">
                  Your Routes
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#FFC72C]/20 flex items-center justify-center">
                  <BusIcon />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#1C1B1B]">
                    {vendorRoutes.length}
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
                <PlusIcon />
                Create New Route
              </PrimaryButton>

              <SecondaryButton
                id="view-all-vendor-routes-btn"
                onClick={() => navigate("/routes/search")}
                width="full"
              >
                View Route Network
              </SecondaryButton>
            </div>
          </section>

          {/* Performance Snapshot / Active Routes */}
          <section className="flex flex-col gap-3">
            <SectionLabel variant="page">
              {vendorRoutes.length > 0
                ? "Your Created Routes"
                : "Active Transit Routes"}
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
                  You haven't created any routes yet.
                </p>
                <PrimaryButton
                  onClick={() => setShowCreateModal(true)}
                  width="auto"
                >
                  Add Your First Route
                </PrimaryButton>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {displayedRoutes.map((route: Route) => (
                <article
                  key={route._id}
                  className="relative flex items-center bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-shadow border border-neutral-100"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#79F7E3] rounded-l-xl" />
                  <div className="flex items-center justify-between w-full pl-5 pr-4 py-3.5 gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#1C1B1B] text-base font-semibold truncate">
                          {route.origin}
                        </span>
                        <ArrowRightIcon />
                        <span className="text-[#1C1B1B] text-base font-semibold truncate">
                          {route.destination}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#FFF4D6] text-[#6F5400]">
                          {route.confidenceLevel} CONFIDENCE
                        </span>
                        <span className="text-[#444748] text-xs capitalize">
                          {route.vehicleType}
                        </span>
                        <span className="text-[#444748] text-xs font-medium">
                          ₦{route.fareLow.toLocaleString()} – ₦
                          {route.fareHigh.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/routes/${route._id}`)}
                      className="shrink-0 w-9 h-9 rounded-full bg-[#FFC72C] flex items-center justify-center hover:brightness-95 transition-all"
                      aria-label="View Route Details"
                    >
                      <BusIcon />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* ── Create Route Modal ────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-lg font-bold text-[#1C1B1B] m-0">
                Create New Transit Route
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-[#444748] transition-colors"
                aria-label="Close modal"
              >
                <CloseIcon />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <TextInput
                label="Origin (Starting Point)"
                placeholder="e.g. Ojota"
                value={formData.origin}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, origin: e.target.value }))
                }
                required
              />

              <TextInput
                label="Destination (Ending Point)"
                placeholder="e.g. CMS"
                value={formData.destination}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    destination: e.target.value,
                  }))
                }
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 px-1">
                  Vehicle Type
                </label>
                <div className="bg-gray-50 rounded-lg px-4 py-3.5 border border-gray-200">
                  <select
                    value={formData.vehicleType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        vehicleType: e.target.value as VehicleType,
                      }))
                    }
                    className="w-full bg-transparent text-gray-900 text-sm outline-none capitalize"
                  >
                    <option value="bus">Bus</option>
                    <option value="keke">Keke</option>
                    <option value="taxi">Taxi</option>
                    <option value="train">Train</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <TextInput
                  label="Fare Low (₦)"
                  type="number"
                  min="1"
                  value={formData.fareLow}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fareLow: Number(e.target.value),
                    }))
                  }
                  required
                />

                <TextInput
                  label="Fare High (₦)"
                  type="number"
                  min="1"
                  value={formData.fareHigh}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fareHigh: Number(e.target.value),
                    }))
                  }
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <SecondaryButton
                  onClick={() => setShowCreateModal(false)}
                  width="auto"
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  disabled={createRouteMutation.isPending}
                  width="auto"
                >
                  {createRouteMutation.isPending
                    ? "Creating…"
                    : "Create Route"}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorRoutes;
