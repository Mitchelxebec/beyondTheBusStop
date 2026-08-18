import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BottomNavBar,
  PageHeader,
  BackButton,
  NotificationBell,
  ConfidenceBadge,
  Toast,
} from "../../components";
import type { ConfidenceLevel } from "../../types/routes";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SavedRouteItem {
  id: string;
  from: string;
  to: string;
  fareLow: number;
  fareHigh: number;
  duration: string;
  distance: string;
  confidence: ConfidenceLevel;
  vehicleType: string;
  stopsCount: number;
  savedAt: string;
  notes?: string;
}

// ── Static / Placeholder Dataset ───────────────────────────────────────────────

/**
 * Static Mock Data for Saved Routes.
 *
 * // TODO: replace with real API response when saved-routes endpoint exists
 * // (feature agreed with team, not yet in PRD or backend as of 2026-08-14).
 * // Backend GET /api/routes exists for all routes, but no user-specific saved/favorite routes endpoint exists yet.
 */
const STATIC_SAVED_ROUTES: SavedRouteItem[] = [
  {
    id: "saved-1",
    from: "Egbeda (Idimu Road)",
    to: "Ikeja / Computer Village",
    fareLow: 300,
    fareHigh: 500,
    duration: "~45 mins",
    distance: "14.2 km",
    confidence: "High",
    vehicleType: "Bus",
    stopsCount: 6,
    savedAt: "Daily Commute",
    notes: "Direct Danfo from Egbeda bus stop to Under Bridge.",
  },
  {
    id: "saved-2",
    from: "Oshodi Interchange",
    to: "Victoria Island (CMS / Eko)",
    fareLow: 400,
    fareHigh: 700,
    duration: "~35 mins",
    distance: "18.5 km",
    confidence: "High",
    vehicleType: "BRT",
    stopsCount: 4,
    savedAt: "Work Route",
    notes: "BRT corridor is fastest between 7:00 AM - 9:00 AM.",
  },
  {
    id: "saved-3",
    from: "Yaba (Tech Hub / Commercial)",
    to: "Lekki Phase 1",
    fareLow: 500,
    fareHigh: 900,
    duration: "~50 mins",
    distance: "21.0 km",
    confidence: "Medium",
    vehicleType: "Bus",
    stopsCount: 8,
    savedAt: "Weekend Route",
    notes: "Switch at Obalende or take express via Toll Gate.",
  },
];

const SAVED_ROUTES_STORAGE_KEY = "btbs_saved_routes";

/**
 * Reads saved routes from localStorage safely.
 * Returns default static routes if storage is uninitialized or corrupted.
 */
function getStoredSavedRoutes(): SavedRouteItem[] {
  try {
    const raw = localStorage.getItem(SAVED_ROUTES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SAVED_ROUTES_STORAGE_KEY, JSON.stringify(STATIC_SAVED_ROUTES));
      return STATIC_SAVED_ROUTES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    console.warn("[SavedRoutes] Invalid stored data format, resetting storage.");
    localStorage.setItem(SAVED_ROUTES_STORAGE_KEY, JSON.stringify(STATIC_SAVED_ROUTES));
    return STATIC_SAVED_ROUTES;
  } catch (err) {
    console.warn("[SavedRoutes] Error reading from localStorage:", err);
    return STATIC_SAVED_ROUTES;
  }
}

/**
 * Writes updated saved routes to localStorage safely.
 */
function saveStoredRoutes(routesList: SavedRouteItem[]): void {
  try {
    localStorage.setItem(SAVED_ROUTES_STORAGE_KEY, JSON.stringify(routesList));
  } catch (err) {
    console.warn("[SavedRoutes] Error writing to localStorage:", err);
  }
}

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

/**
 * Saved Routes Screen — Dedicated commuter page.
 * Displays commuter's saved / bookmarked daily routes with confidence indicators,
 * transit fares, estimated time, and route detail preview modal.
 * Persists additions and removals to browser localStorage.
 */
const SavedRoutes = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<SavedRouteItem[]>(() => getStoredSavedRoutes());
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<SavedRouteItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemoveSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRoutes((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveStoredRoutes(updated);
      return updated;
    });
    showToast("Route removed from saved list");
  };

  const filteredRoutes = routes.filter(
    (r) =>
      r.from.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.to.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.vehicleType.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-dvh bg-[#FDFCFA] text-[#1C1B1B]">
      {/* 1 · Fixed Top Navigation Bar (Untouched per core rules) */}
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
            <p className="text-sm text-[#444748] m-0">
              Quick access to your regular commute corridors
            </p>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F4F1EE] text-[#5A5C5D]">
              {routes.length} Saved
            </span>
          </div>

          {/* Search Filter Input */}
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

          {/* Routes List */}
          <section aria-label="Saved routes list" className="flex flex-col gap-3.5 pt-1">
            {filteredRoutes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-black/6">
                <div className="w-14 h-14 rounded-full bg-[#F4F1EE] flex items-center justify-center text-[#747878] mb-3">
                  <BookmarkFilledIcon />
                </div>
                <h3 className="text-base font-bold text-[#1C1B1B] m-0">
                  {routes.length === 0 ? "No saved routes yet" : "No matches found"}
                </h3>
                <p className="text-xs sm:text-sm text-[#747878] max-w-xs mt-1 mb-5">
                  {routes.length === 0
                    ? "Bookmark your frequent transit routes from search results for 1-tap commute updates."
                    : "Try searching with a different station or bus stop name."}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/routes")}
                  className="py-2.5 px-5 rounded-xl bg-[#FFC72C] text-[#1C1B1B] font-bold text-sm hover:brightness-95 active:scale-95 transition-all shadow-sm"
                >
                  Explore Routes
                </button>
              </div>
            ) : (
              filteredRoutes.map((route) => (
                <div
                  key={route.id}
                  onClick={() => setSelectedRoute(route)}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-black/6 shadow-sm hover:border-black/15 transition-all cursor-pointer group flex flex-col gap-3"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedRoute(route);
                  }}
                  aria-label={`View details for route from ${route.from} to ${route.to}`}
                >
                  {/* Top row: Tags + Bookmark toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F4F1EE] text-[#444748] text-xs font-semibold">
                        {route.vehicleType}
                      </span>
                      <ConfidenceBadge level={route.confidence} />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveSaved(route.id, e)}
                      title="Remove from saved routes"
                      className="p-1.5 rounded-lg text-[#FFC72C] hover:bg-[#F4F1EE] transition-colors"
                      aria-label={`Remove ${route.from} to ${route.to} from saved routes`}
                    >
                      <BookmarkFilledIcon />
                    </button>
                  </div>

                  {/* Middle row: Origin -> Destination */}
                  <div className="flex items-center gap-2 text-[#1C1B1B]">
                    <span className="font-bold text-base sm:text-lg tracking-tight">
                      {route.from}
                    </span>
                    <span className="text-[#747878] shrink-0">
                      <ArrowRightIcon />
                    </span>
                    <span className="font-bold text-base sm:text-lg tracking-tight">
                      {route.to}
                    </span>
                  </div>

                  {/* Bottom row: Time, Fare range, Category */}
                  <div className="flex items-center justify-between pt-2 border-t border-black/5 text-xs text-[#747878]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-medium">
                        <ClockIcon />
                        {route.duration}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-[#1C1B1B]">
                        ₦{route.fareLow} - ₦{route.fareHigh}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#5A5C5D] bg-[#F4F1EE] px-2 py-0.5 rounded-md">
                      {route.savedAt}
                    </span>
                  </div>
                </div>
              ))
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
                  Route Details
                </span>
                <h3 className="text-lg font-bold text-[#1C1B1B] m-0">
                  {selectedRoute.from} → {selectedRoute.to}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRoute(null)}
                className="w-8 h-8 rounded-full bg-[#F4F1EE] flex items-center justify-center text-[#444748] hover:bg-[#EAE7E4] transition-colors"
                aria-label="Close route detail modal"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 bg-[#F9F8F6] p-3.5 rounded-xl border border-black/5 text-center">
              <div>
                <span className="text-xs text-[#747878] block">Est. Fare</span>
                <span className="text-sm sm:text-base font-bold text-[#1C1B1B]">
                  ₦{selectedRoute.fareLow} - ₦{selectedRoute.fareHigh}
                </span>
              </div>
              <div className="border-x border-black/8">
                <span className="text-xs text-[#747878] block">Duration</span>
                <span className="text-sm sm:text-base font-bold text-[#1C1B1B]">
                  {selectedRoute.duration}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#747878] block">Stops</span>
                <span className="text-sm sm:text-base font-bold text-[#1C1B1B]">
                  {selectedRoute.stopsCount} Stops
                </span>
              </div>
            </div>

            {/* Transit Notes & Confidence */}
            <div className="flex flex-col gap-2 text-sm text-[#444748]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1C1B1B]">Confidence Score</span>
                <ConfidenceBadge level={selectedRoute.confidence} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1C1B1B]">Transit Mode</span>
                <span className="font-medium text-[#1C1B1B]">{selectedRoute.vehicleType}</span>
              </div>
              {selectedRoute.notes && (
                <div className="p-3 bg-[#FEF7E0]/60 rounded-xl border border-[#FEEFC3] text-xs text-[#8A5800] mt-1">
                  <strong>Commute Note:</strong> {selectedRoute.notes}
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedRoute(null);
                  navigate(`/search?from=${encodeURIComponent(selectedRoute.from)}&to=${encodeURIComponent(selectedRoute.to)}`);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#FFC72C] text-[#1C1B1B] font-bold text-sm hover:brightness-95 transition-all text-center"
              >
                Search Live Buses
              </button>
              <button
                type="button"
                onClick={() => setSelectedRoute(null)}
                className="py-3 px-4 rounded-xl bg-[#F4F1EE] text-[#1C1B1B] font-medium text-sm hover:bg-[#EAE7E4] transition-colors"
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
