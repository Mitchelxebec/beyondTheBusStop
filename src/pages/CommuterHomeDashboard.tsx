import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { BottomNavBar, SectionLabel, RouteDetailModal } from "../components";
import { useAuth } from "../contexts/AuthContext";
import { getAllRoutes, searchRoutes } from "../services/routes";
import { getSafetyPoints } from "../services/safetyPoints";
import type { Route, ConfidenceLevel } from "../types/routes";
import type { SafetyPoint, SafetyPointCategory } from "../types/safetyPoints";

// ─── localStorage helpers (recent searches — no backend endpoint for this) ──────

const RECENT_SEARCHES_KEY = "btbs_recent_searches";
const MAX_RECENT_SEARCHES = 5;

function loadRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string): string[] {
  const prev = loadRecentSearches();
  const updated = [query, ...prev.filter((q) => q !== query)].slice(
    0,
    MAX_RECENT_SEARCHES
  );
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  return updated;
}

// ─── Icons ──────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="5.5" stroke="#747878" strokeWidth="1.5" />
    <path d="M12.5 12.5L15.5 15.5" stroke="#747878" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const NavigateTurnIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path d="M8 2L13 7L8 12" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 7H13" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const ArrowRightSmallIcon = () => (
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

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <circle cx="6" cy="6" r="5" stroke="#444748" strokeWidth="1.2" />
    <path d="M6 3.5V6L7.5 7.5" stroke="#444748" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Safety Point category icons — one per backend enum value
const PoliceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 2L4 5V10C4 13.5 6.5 16.7 10 18C13.5 16.7 16 13.5 16 10V5L10 2Z" stroke="#444748" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M7 10L9 12L13 8" stroke="#444748" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HospitalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="16" height="16" rx="2" stroke="#444748" strokeWidth="1.3" />
    <path d="M9 5V13M5 9H13" stroke="#444748" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const FireIcon = () => (
  <svg width="16" height="20" viewBox="0 0 16 20" fill="none" aria-hidden="true">
    <path d="M8 1C8 1 13 6 13 11C13 14.3 10.8 17 8 17C5.2 17 3 14.3 3 11C3 9 4 7.5 5 6.5C5 8 6 9 7 9C5.5 7 6 4 8 1Z" stroke="#444748" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 13C8 13 10 11.5 10 10C10 10 9 11 8 11C7 11 6 10 6 10C6 11.5 8 13 8 13Z" stroke="#444748" strokeWidth="1.1" strokeLinejoin="round" />
  </svg>
);

const OtherLocationIcon = () => (
  <svg width="16" height="20" viewBox="0 0 16 20" fill="none" aria-hidden="true">
    <path d="M8 1C4.7 1 2 3.7 2 7C2 11.5 8 19 8 19C8 19 14 11.5 14 7C14 3.7 11.3 1 8 1Z" stroke="#444748" strokeWidth="1.3" />
    <circle cx="8" cy="7" r="2.5" stroke="#444748" strokeWidth="1.2" />
  </svg>
);

// ─── Confidence Badge ──────────────────────────────────────────────────────────
// Maps backend confidenceLevel ('High' | 'Medium' | 'Low') to colour classes

const CONFIDENCE_CLASSES: Record<ConfidenceLevel, string> = {
  High:   "bg-[#79F7E3] text-[#005047]",
  Medium: "bg-[#FFF4D6] text-[#6F5400]",
  Low:    "bg-[#FCE8E6] text-[#BA1A1A]",
};

const ConfidenceBadge = ({ level }: { level: ConfidenceLevel }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide leading-none ${CONFIDENCE_CLASSES[level]}`}
  >
    {level} CONFIDENCE
  </span>
);

// ─── Safety Point category → icon map (backend enum values only) ──────────────

const CATEGORY_ICON: Record<SafetyPointCategory, React.ReactNode> = {
  "police station": <PoliceIcon />,
  "hospital":       <HospitalIcon />,
  "fire station":   <FireIcon />,
  "other":          <OtherLocationIcon />,
};

// ─── Route Card ────────────────────────────────────────────────────────────────
// Uses the real Route type from types/routes.ts — no local QuickRoute interface

const RouteCard = ({
  route,
  onSelect,
}: {
  route: Route;
  onSelect: (route: Route) => void;
}) => (
  <article
    onClick={() => onSelect(route)}
    className="relative flex items-center bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-shadow cursor-pointer"
  >
    {/* 4px teal left accent bar */}
    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#79F7E3] rounded-l-xl" aria-hidden="true" />

    <div className="flex items-center justify-between w-full pl-5 pr-3 py-3 gap-4">
      <div className="flex flex-col gap-1 min-w-0">
        {/* Origin → Destination */}
        <div className="flex items-center gap-1">
          <span className="text-[#1C1B1B] text-base leading-6 font-normal truncate">
            {route.origin}
          </span>
          <ArrowRightSmallIcon />
          <span className="text-[#1C1B1B] text-base leading-6 font-normal truncate">
            {route.destination}
          </span>
        </div>
        {/* Confidence + vehicle type + fare range */}
        <div className="flex items-center gap-2 flex-wrap">
          <ConfidenceBadge level={route.confidenceLevel} />
          <span className="text-[#444748] text-sm leading-5 capitalize">
            {route.vehicleType}
          </span>
          <span className="text-[#444748] text-sm leading-5">
            ₦{route.fareLow.toLocaleString()} – ₦{route.fareHigh.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        id={`navigate-route-${route._id}`}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(route);
        }}
        aria-label={`View route from ${route.origin} to ${route.destination}`}
        className="shrink-0 w-10 h-10 rounded-full bg-[#FFC72C] flex items-center justify-center transition-transform active:scale-95 hover:brightness-95 cursor-pointer"
      >
        <BusIcon />
      </button>
    </div>
  </article>
);

// ─── Safety Point Item ─────────────────────────────────────────────────────────
// Uses the real SafetyPoint type from types/safetyPoints.ts

const SafetyPointItem = ({ point }: { point: SafetyPoint }) => {
  const icon =
    point.category ? CATEGORY_ICON[point.category] : <OtherLocationIcon />;

  return (
    <div
      className="flex flex-col items-center gap-2 shrink-0"
      title={point.address ?? point.name}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#F1EDEC] flex items-center justify-center">
        {icon}
      </div>
      <span className="text-[#444748] text-[10px] leading-3.75 font-normal text-center w-14 line-clamp-2">
        {point.name}
      </span>
    </div>
  );
};

// ─── Recent Search Item ────────────────────────────────────────────────────────

const RecentSearchItem = ({
  query,
  hasBorderBottom,
  onSelect,
}: {
  query: string;
  hasBorderBottom: boolean;
  onSelect: (query: string) => void;
}) => (
  <button
    onClick={() => onSelect(query)}
    aria-label={`Search again: ${query}`}
    className={`flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors ${
      hasBorderBottom ? "border-b border-neutral-100" : ""
    }`}
  >
    <div className="w-8 h-8 rounded-full bg-[#EBE7E6] flex items-center justify-center shrink-0">
      <ClockIcon />
    </div>
    <span className="text-[#1C1B1B] text-base leading-6 font-normal">{query}</span>
  </button>
);

// ─── Main Component ────────────────────────────────────────────────────────────

/**
 * CommuterHomeDashboard
 *
 * Figma node 178:248 — "Commuter Home Dashboard".
 * All data fetched from the live backend — no hardcoded route or safety point data.
 *
 * Layout tiers:
 *   Mobile  (<md) — single column, full-width, hamburger nav.
 *   Tablet  (md)  — single column centred at max-w-lg, navbar links visible.
 *   Desktop (lg+) — single column centred at max-w-2xl, navbar links visible.
 */
const CommuterHomeDashboard = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  // Resolve display name from session (commuter = fullName, business = businessName)
  const userName =
    session?.user?.fullName ?? session?.user?.businessName ?? "there";

  // Time-of-day greeting
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return `Good morning, ${userName}`;
    if (h < 17) return `Good afternoon, ${userName}`;
    return `Good evening, ${userName}`;
  })();

  // ── Search state ────────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(
    loadRecentSearches
  );
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    if (!val.trim()) {
      setActiveSearch("");
    }
  };

  const handleSearch = () => {
    const q = searchInput.trim();
    if (!q) return;
    setActiveSearch(q);
    setRecentSearches(saveRecentSearch(q));
  };

  const handleRecentClick = (query: string) => {
    setSearchInput(query);
    setActiveSearch(query);
    setRecentSearches(saveRecentSearch(query));
  };

  // ── Data queries ────────────────────────────────────────────────────────────

  const {
    data: allRoutesData,
    isLoading: allRoutesLoading,
    isError: allRoutesError,
  } = useQuery({
    queryKey: ["routes"],
    queryFn: getAllRoutes,
  });

  const {
    data: searchData,
    isLoading: searchLoading,
    isError: searchError,
  } = useQuery({
    queryKey: ["routes", "search", activeSearch],
    queryFn: () => searchRoutes(activeSearch),
    enabled: activeSearch.length > 0,
  });

  const {
    data: safetyData,
    isLoading: safetyLoading,
    isError: safetyError,
  } = useQuery({
    queryKey: ["safety-points"],
    queryFn: getSafetyPoints,
  });

  // ── Derived display values ──────────────────────────────────────────────────

  const isSearching = activeSearch.length > 0;

  // When searching, use search results; otherwise use all routes
  const displayedRoutes: Route[] = isSearching
    ? (searchData?.routes ?? [])
    : (allRoutesData?.routes ?? []);

  const routesLoading = isSearching ? searchLoading : allRoutesLoading;
  const routesError   = isSearching ? searchError   : allRoutesError;

  const safetyPoints: SafetyPoint[] = safetyData?.safetyPoints ?? [];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-dvh bg-[#FDFAF8]">

      {/* ── Top navbar ──────────────────────────────────────────────────── */}
      <BottomNavBar />

      {/*
        Main content starts below the fixed h-16 navbar.
        pt-16 clears the navbar; inner gap-6 handles section spacing.
        Responsive container centres content on tablet/desktop.
      */}
      <main
        id="home-main"
        className="flex-1 w-full mx-auto pt-16"
        style={{ maxWidth: "min(100%, 42rem)" }}
        aria-label="Home dashboard content"
      >
        <div className="flex flex-col gap-6 px-4 sm:px-6 pt-8 pb-12">

          {/* 1 · Greeting ─────────────────────────────────────────────── */}
          <section aria-labelledby="greeting-heading" className="flex flex-col gap-1">
            <h1
              id="greeting-heading"
              className="text-[#1C1B1B] text-base leading-6 font-normal m-0"
            >
              {greeting}
            </h1>
            <p className="text-[#444748] text-base leading-6 font-normal m-0">
              Lagos is moving fast today. Where to?
            </p>
          </section>

          {/* 2 · Search Bar ───────────────────────────────────────────── */}
          <section aria-label="Search for a destination">
            <div className="relative flex items-center">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              >
                <SearchIcon />
              </span>
              <input
                id="destination-search"
                type="search"
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                placeholder="Where are you going?"
                aria-label="Search for your destination"
                className="w-full h-12 pl-10 pr-14 rounded-lg bg-[#E5E2E1] text-base leading-6 text-[#1C1B1B] placeholder:text-[#C4C7C7] outline-none focus:ring-2 focus:ring-[#79F7E3]/60 transition-shadow"
              />
              <button
                id="search-navigate-btn"
                onClick={handleSearch}
                aria-label="Search destination"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1C1B1B] flex items-center justify-center transition-transform active:scale-95 hover:bg-black"
              >
                <NavigateTurnIcon />
              </button>
            </div>
          </section>

          {/* 3 · Routes ───────────────────────────────────────────────── */}
          <section aria-labelledby="routes-heading" className="flex flex-col gap-3">
            <SectionLabel
              variant="page"
              action={
                isSearching ? (
                  <button
                    id="clear-search-btn"
                    onClick={() => { setSearchInput(""); setActiveSearch(""); }}
                    aria-label="Clear search and show all routes"
                    className="text-[#59DBC7] text-sm font-medium hover:underline transition-colors"
                  >
                    Clear
                  </button>
                ) : (
                  <button
                    id="view-all-routes-btn"
                    onClick={() => navigate("/routes")}
                    aria-label="View all routes"
                    className="text-[#59DBC7] text-sm font-medium hover:underline transition-colors"
                  >
                    View All
                  </button>
                )
              }
            >
              {isSearching ? `Results for "${activeSearch}"` : "Quick Routes"}
            </SectionLabel>

            {routesLoading && (
              <p className="text-[#444748] text-sm text-center py-6">
                Loading routes…
              </p>
            )}

            {!routesLoading && routesError && (
              <p className="text-red-500 text-sm text-center py-6">
                Failed to load routes. Please try again.
              </p>
            )}

            {!routesLoading && !routesError && displayedRoutes.length === 0 && (
              <p className="text-[#444748] text-sm text-center py-6">
                {isSearching
                  ? `No routes found for "${activeSearch}".`
                  : "No routes available yet."}
              </p>
            )}

            <div className="flex flex-col gap-3">
              {displayedRoutes.map((route) => (
                <RouteCard
                  key={route._id}
                  route={route}
                  onSelect={(r) => setSelectedRoute(r)}
                />
              ))}
            </div>
          </section>

          {/* 4 · Nearby Essentials (safety points from backend) ────────── */}
          <section aria-labelledby="nearby-essentials-heading" className="flex flex-col gap-3">
            <SectionLabel variant="page">Nearby Essentials</SectionLabel>

            {safetyLoading && (
              <p className="text-[#444748] text-sm text-center py-6">
                Loading essentials…
              </p>
            )}

            {!safetyLoading && safetyError && (
              <p className="text-red-500 text-sm text-center py-6">
                Failed to load safety points.
              </p>
            )}

            {!safetyLoading && !safetyError && safetyPoints.length === 0 && (
              <p className="text-[#444748] text-sm text-center py-6">
                No safety points available yet.
              </p>
            )}

            {!safetyLoading && !safetyError && safetyPoints.length > 0 && (
              <div className="-mx-4 sm:-mx-6 px-4 sm:px-6 overflow-x-auto no-scrollbar">
                <div className="flex gap-4 sm:gap-6 pb-1">
                  {safetyPoints.map((point) => (
                    <SafetyPointItem key={point._id} point={point} />
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 5 · Recent Searches (stored in localStorage) ──────────────── */}
          {recentSearches.length > 0 && (
            <section aria-labelledby="recent-searches-heading" className="flex flex-col gap-3">
              <SectionLabel variant="page">Recent Searches</SectionLabel>

              <div className="bg-white rounded-xl overflow-hidden shadow-xs">
                {recentSearches.map((query, index) => (
                  <RecentSearchItem
                    key={query}
                    query={query}
                    hasBorderBottom={index < recentSearches.length - 1}
                    onSelect={handleRecentClick}
                  />
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      {/* Route Detail Modal */}
      <RouteDetailModal
        route={selectedRoute}
        onClose={() => setSelectedRoute(null)}
      />
    </div>
  );
};

export default CommuterHomeDashboard;
