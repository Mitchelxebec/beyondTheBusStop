import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Search, Clock, Shield, Hospital, Flame, MapPin } from "lucide-react";
import {
  BottomNavBar,
  SectionLabel,
  RouteDetailModal,
  RouteCard,
} from "../components";
import { useAuth } from "../contexts/AuthContext";
import { useRoutes } from "../hooks/useRoutes";
import { getSafetyPoints } from "../services/safetyPoints";
import type { Route } from "../types/routes";
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

// ─── Icons & Safety Category Map ───────────────────────────────────────────────

/**
 * Flagged Custom Icon Exception:
 * NavigateTurnIcon is preserved as custom SVG for exact visual match with turn arrow UI design.
 */
const NavigateTurnIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path d="M8 2L13 7L8 12" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 7H13" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

// Safety Point category icons using lucide-react
const CATEGORY_ICON: Record<SafetyPointCategory, React.ReactNode> = {
  "police station": <Shield className="w-5 h-5 text-[#444748]" aria-hidden="true" />,
  "hospital":       <Hospital className="w-5 h-5 text-[#444748]" aria-hidden="true" />,
  "fire station":   <Flame className="w-5 h-5 text-[#444748]" aria-hidden="true" />,
  "other":          <MapPin className="w-5 h-5 text-[#444748]" aria-hidden="true" />,
};

// ─── Safety Point Item ─────────────────────────────────────────────────────────
// Uses the real SafetyPoint type from types/safetyPoints.ts

const SafetyPointItem = ({ point }: { point: SafetyPoint }) => {
  const icon =
    point.category ? CATEGORY_ICON[point.category] : <MapPin className="w-5 h-5 text-[#444748]" aria-hidden="true" />;

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
      <Clock className="w-3.5 h-3.5 text-[#444748]" aria-hidden="true" />
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
    data: displayedRoutes = [],
    isLoading: routesLoading,
    isError: routesError,
  } = useRoutes(activeSearch);

  const {
    data: safetyData,
    isLoading: safetyLoading,
    isError: safetyError,
  } = useQuery({
    queryKey: ["safety-points"],
    queryFn: getSafetyPoints,
  });

  // ── Derived display values ──────────────────────────────────────────────────

  const isSearching = activeSearch.trim().length > 0;
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
                <Search className="w-4.5 h-4.5 text-[#747878]" />
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
