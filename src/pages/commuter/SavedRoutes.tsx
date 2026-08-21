import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BottomNavBar,
  PageHeader,
  BackButton,
  NotificationBell,
  ConfidenceBadge,
  Toast,
} from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import { useRoutes } from "../../hooks/useRoutes";
import {
  getRoutePlaceName,
  formatFareRange,
  formatTimeAgo,
  type Route,
} from "../../types/routes";
import {
  getSavedRouteIds,
  removeRouteId,
} from "../../services/savedRoutes";

/**
 * Saved Routes Screen — Dedicated commuter page.
 *
 * KNOWN ARCHITECTURAL LIMITATION & FUTURE BACKEND TASK:
 * Saved routes are persisted to browser `localStorage` namespaced by user ID (`session.user._id`).
 * Because there is currently no user saved-routes endpoint in BTBS-BACKEND, this is scoped strictly
 * per-browser/per-device and does not synchronize across devices.
 * Future Backend Task: Replace localStorage persistence with a dedicated backend API endpoint
 * (e.g. GET/POST/DELETE /api/users/saved-routes) once server schema is introduced.
 */

// ── Icons ──────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="5.5" stroke="#747878" strokeWidth="1.5" />
    <path d="M12.5 12.5L15.5 15.5" stroke="#747878" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const BookmarkFilledIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFC72C" stroke="#B88A00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <circle cx="6" cy="6" r="5" stroke="#747878" strokeWidth="1.2" />
    <path d="M6 3.5V6L7.5 7.5" stroke="#747878" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="#1C1B1B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Component ─────────────────────────────────────────────────────────────────

const SavedRoutes = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const userId = session?.user?._id || session?.user?.id;

  // Live query for all routes across the transit network
  const { data: allRoutes = [], isLoading } = useRoutes();

  // Read persisted saved route IDs from namespaced localStorage
  const [savedIds, setSavedIds] = useState<string[]>(() => getSavedRouteIds(userId));
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state if user changes
  useEffect(() => {
    setSavedIds(getSavedRouteIds(userId));
  }, [userId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter live routes down to only user-saved IDs
  const savedRoutes: Route[] = allRoutes.filter(
    (r) => savedIds.includes(r._id) || (r.id && savedIds.includes(r.id))
  );

  // Remove action — permanently persists to localStorage
  const handleRemoveSaved = (routeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedIds = removeRouteId(routeId, userId);
    setSavedIds(updatedIds);
    if (selectedRoute && (selectedRoute._id === routeId || selectedRoute.id === routeId)) {
      setSelectedRoute(null);
    }
    showToast("Route removed from saved list");
  };

  // Client-side text filter on saved corridors
  const filteredRoutes = savedRoutes.filter((r) => {
    const origin = getRoutePlaceName(r.origin).toLowerCase();
    const dest = getRoutePlaceName(r.destination).toLowerCase();
    const vehicle = (r.vehicleType || "").toLowerCase();
    const query = filterQuery.toLowerCase();
    return (
      origin.includes(query) ||
      dest.includes(query) ||
      vehicle.includes(query)
    );
  });

  return (
    <div className="flex flex-col min-h-dvh bg-[#FDFCFA] text-[#1C1B1B]">
      {/* 1 · Fixed Top Navigation Bar */}
      <BottomNavBar />

      {/* 2 · Main Content Area */}
      <main
        id="saved-routes-main"
        className="flex-1 w-full mx-auto pt-16"
        style={{ maxWidth: "min(100%, 68rem)" }}
        aria-label="Saved routes content"
      >
        <div className="flex flex-col gap-5 px-4 sm:px-6 pt-6 pb-16">
          
          {/* Header Title with Back Button and Notification Bell */}
          <PageHeader
            title="Saved Routes"
            className="px-0 pt-0 pb-0"
            leading={
              <BackButton
                onClick={() => navigate(-1)}
                aria-label="Go back to previous page"
              />
            }
            trailing={<NotificationBell />}
          />

          {/* Subtitle / Counter */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#444748] m-0">
              Quick access to your regular commute corridors
            </p>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F4F1EE] text-[#5A5C5D]">
              {savedRoutes.length} Saved
            </span>
          </div>

          {/* Search Filter Input (shown when user has saved routes) */}
          {savedRoutes.length > 0 && (
            <div className="relative flex items-center">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
                <SearchIcon />
              </span>
              <input
                id="saved-routes-filter"
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search saved origins or destinations…"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#F4F1EE] text-sm text-[#1C1B1B] placeholder:text-[#747878] outline-none focus:ring-2 focus:ring-[#79F7E3]/60 transition-all border border-black/5"
              />
            </div>
          )}

          {/* Routes List */}
          <section aria-label="Saved routes list" className="flex flex-col gap-3.5 pt-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-8 h-8 border-3 border-[#005047] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs text-[#747878]">Loading your saved routes…</p>
              </div>
            ) : filteredRoutes.length === 0 ? (
              /* Genuine Empty State */
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-black/6">
                <div className="w-14 h-14 rounded-full bg-[#F4F1EE] flex items-center justify-center text-[#747878] mb-3">
                  <BookmarkFilledIcon />
                </div>
                <h3 className="text-base font-bold text-[#1C1B1B] m-0">
                  {savedRoutes.length === 0 ? "No saved routes yet" : "No matches found"}
                </h3>
                <p className="text-xs sm:text-sm text-[#747878] max-w-xs mt-1 mb-5">
                  {savedRoutes.length === 0
                    ? "Bookmark your frequent transit routes from route details for 1-tap commute updates."
                    : "Try searching with a different station or bus stop name."}
                </p>
                <button
                  type="button"
                  id="explore-routes-btn"
                  onClick={() => navigate("/routes")}
                  className="py-2.5 px-5 rounded-xl bg-[#FFC72C] text-[#1C1B1B] font-bold text-sm hover:brightness-95 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  Explore Routes
                </button>
              </div>
            ) : (
              /* Live Filtered Saved Route Cards */
              filteredRoutes.map((route) => {
                const originName = getRoutePlaceName(route.origin);
                const destName = getRoutePlaceName(route.destination);
                const fareDisplay = formatFareRange(route.fareLow, route.fareHigh);
                const routeKey = route._id || route.id || "";

                return (
                  <div
                    key={routeKey}
                    onClick={() => setSelectedRoute(route)}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-black/6 shadow-sm hover:border-black/15 transition-all cursor-pointer group flex flex-col gap-3"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setSelectedRoute(route);
                    }}
                    aria-label={`View details for route from ${originName} to ${destName}`}
                  >
                    {/* Top row: Tags + Bookmark toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F4F1EE] text-[#444748] text-xs font-semibold capitalize">
                          {route.vehicleType}
                        </span>
                        <ConfidenceBadge level={route.confidenceLevel} />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveSaved(routeKey, e)}
                        title="Remove from saved routes"
                        className="p-1.5 rounded-lg text-[#FFC72C] hover:bg-[#F4F1EE] transition-colors cursor-pointer"
                        aria-label={`Remove ${originName} to ${destName} from saved routes`}
                      >
                        <BookmarkFilledIcon />
                      </button>
                    </div>

                    {/* Middle row: Origin -> Destination */}
                    <div className="flex items-center gap-2 text-[#1C1B1B]">
                      <span className="font-bold text-base sm:text-lg tracking-tight truncate">
                        {originName}
                      </span>
                      <span className="text-[#747878] shrink-0">
                        <ArrowRightIcon />
                      </span>
                      <span className="font-bold text-base sm:text-lg tracking-tight truncate">
                        {destName}
                      </span>
                    </div>

                    {/* Bottom row: Creation timestamp / Fare range */}
                    <div className="flex items-center justify-between pt-2 border-t border-black/5 text-xs text-[#747878]">
                      <div className="flex items-center gap-3">
                        {route.createdAt && (
                          <span className="flex items-center gap-1 font-medium">
                            <ClockIcon />
                            {formatTimeAgo(route.createdAt)}
                          </span>
                        )}
                        {route.createdAt && <span>•</span>}
                        <span className="font-bold text-[#1C1B1B]">
                          {fareDisplay}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#005047] bg-[#79F7E3]/30 px-2 py-0.5 rounded-md">
                        Saved Corridor
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </section>

        </div>
      </main>

      {/* Route Detail Modal / Slide-over preview */}
      {selectedRoute && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedRoute(null)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-black/10 flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-black/8 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#747878]">
                  Saved Corridor
                </span>
                <h3 className="text-lg font-bold text-[#1C1B1B] m-0 flex items-center gap-1.5">
                  <span>{getRoutePlaceName(selectedRoute.origin)}</span>
                  <span className="text-[#747878]">→</span>
                  <span>{getRoutePlaceName(selectedRoute.destination)}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRoute(null)}
                className="w-8 h-8 rounded-full bg-[#F4F1EE] flex items-center justify-center text-[#444748] hover:bg-[#EAE7E4] transition-colors cursor-pointer"
                aria-label="Close route detail modal"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 bg-[#F9F8F6] p-3.5 rounded-xl border border-black/5 text-center">
              <div>
                <span className="text-xs text-[#747878] block">Est. Fare</span>
                <span className="text-sm sm:text-base font-bold text-[#1C1B1B]">
                  {formatFareRange(selectedRoute.fareLow, selectedRoute.fareHigh)}
                </span>
              </div>
              <div className="border-l border-black/8">
                <span className="text-xs text-[#747878] block">Transit Mode</span>
                <span className="text-sm sm:text-base font-bold text-[#1C1B1B] capitalize">
                  {selectedRoute.vehicleType}
                </span>
              </div>
            </div>

            {/* Transit Guidance & Confidence */}
            <div className="flex flex-col gap-2.5 text-sm text-[#444748]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1C1B1B]">Confidence Score</span>
                <ConfidenceBadge level={selectedRoute.confidenceLevel} />
              </div>
              {selectedRoute.boardingPoint && (
                <div className="p-3 bg-[#F4F1EE] rounded-xl text-xs text-[#444748]">
                  <strong className="text-[#1C1B1B]">Boarding Point:</strong>{" "}
                  {getRoutePlaceName(selectedRoute.boardingPoint)}
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const targetId = selectedRoute._id || selectedRoute.id;
                  setSelectedRoute(null);
                  navigate(`/routes/${targetId}`);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#FFC72C] text-[#1C1B1B] font-bold text-sm hover:brightness-95 transition-all text-center cursor-pointer shadow-xs"
              >
                View Full Route Details
              </button>
              <button
                type="button"
                onClick={() => setSelectedRoute(null)}
                className="py-3 px-4 rounded-xl bg-[#F4F1EE] text-[#1C1B1B] font-medium text-sm hover:bg-[#EAE7E4] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
};

export default SavedRoutes;
