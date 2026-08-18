import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Map } from "lucide-react";
import {
  BackButton,
  SectionLabel,
  BottomNavBar,
  RouteCard,
  VENDOR_NAV_ITEMS,
} from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import { useRoutes } from "../../hooks/useRoutes";

// ── Loading Skeleton ──────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="px-5 pt-5 pb-4 flex items-start gap-3">
      <div className="flex flex-col items-center pt-1 gap-1 shrink-0">
        <span className="w-3 h-3 rounded-full bg-gray-200" />
        <span className="w-0.5 h-8 bg-gray-200 rounded-full" />
        <span className="w-3 h-3 rounded-full bg-gray-200" />
      </div>
      <div className="flex flex-col gap-3 flex-1">
        <div className="flex flex-col gap-1.5">
          <div className="h-2.5 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-28 bg-gray-200 rounded" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-2.5 w-8 bg-gray-200 rounded" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
    <div className="h-px bg-gray-100 mx-5" />
    <div className="px-5 py-4 flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="h-5 w-24 bg-gray-100 rounded-full" />
      </div>
      <div className="h-9 w-24 bg-gray-200 rounded-xl" />
    </div>
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────

const EmptyState = ({
  activeQuery,
  onReset,
}: {
  activeQuery: string;
  onReset: () => void;
}) => (
  <div className="flex flex-col items-center gap-3 py-12 text-center bg-white rounded-2xl p-6 border border-gray-100">
    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4C7C7" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    </div>
    <div className="flex flex-col gap-1">
      <p className="text-sm font-semibold text-gray-900">
        {activeQuery ? `No routes found matching "${activeQuery}"` : "No routes available"}
      </p>
      <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
        Try searching with a different destination name or clear filters.
      </p>
    </div>
    <button
      type="button"
      onClick={onReset}
      className="mt-2 px-4 py-2 rounded-xl bg-[#F5B800] text-[#1A1A1A] text-xs font-semibold hover:bg-[#FFCA28] transition-colors"
    >
      Reset & Show All Routes
    </button>
  </div>
);

// ── Filter Pill ───────────────────────────────────────────────────────────────

const Pill = ({
  children,
  active = false,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
      border transition-all duration-150 active:scale-95 shrink-0 cursor-pointer
      ${active
        ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
      }
    `}
  >
    {children}
  </button>
);

// ── Page Component ────────────────────────────────────────────────────────────

const SearchResults = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const isBusiness = session?.role === "business";
  const [searchParams, setSearchParams] = useSearchParams();

  // Read search query from URL
  const initialQuery =
    searchParams.get("destination") ?? searchParams.get("query") ?? "";

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<"cheapest" | "confidence" | "all">("cheapest");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("All");

  // Synchronize when URL search param changes
  useEffect(() => {
    const q = searchParams.get("destination") ?? searchParams.get("query") ?? "";
    setSearchInput(q);
    setActiveQuery(q);
  }, [searchParams]);

  // Live query: searches when query is non-empty, otherwise fetches all routes
  const { data: routes = [], isLoading, isError, error } = useRoutes(activeQuery);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchInput.trim();
    setActiveQuery(trimmed);
    if (trimmed) {
      setSearchParams({ destination: trimmed });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    setActiveQuery("");
    setSelectedVehicle("All");
    setSortBy("cheapest");
    setSearchParams({});
  };

  // Filter and Sort live backend data
  const sortedAndFiltered = useMemo(() => {
    return routes
      .filter((route) => {
        if (selectedVehicle !== "All") {
          if (route.vehicleType.toLowerCase() !== selectedVehicle.toLowerCase()) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "cheapest") return a.fareLow - b.fareLow;
        if (sortBy === "confidence") {
          const score = { High: 3, Medium: 2, Low: 1, Unconfirmed: 0 };
          return (score[b.confidenceLevel] || 0) - (score[a.confidenceLevel] || 0);
        }
        return 0;
      });
  }, [routes, selectedVehicle, sortBy]);

  const hasResults = sortedAndFiltered.length > 0;

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F0]">
      {/* Top Navbar */}
      <BottomNavBar items={isBusiness ? VENDOR_NAV_ITEMS : undefined} />

      {/* Sticky header — top-16 matches the h-16 navbar */}
      <div className="sticky top-16 z-20 bg-[#F5F5F0]/95 backdrop-blur-sm border-b border-gray-200 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 w-full mx-auto" style={{ maxWidth: "min(100%, 68rem)" }}>
          <BackButton onClick={() => navigate(-1)} />
          <span className="text-base font-semibold text-gray-900">
            Destination Search
          </span>
        </div>
      </div>

      <main className="flex-1 px-4 pt-20 pb-16 flex flex-col gap-4 w-full mx-auto" style={{ maxWidth: "min(100%, 68rem)" }}>
        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
            <Search className="w-4.5 h-4.5 text-[#747878]" />
          </span>
          <input
            id="search-destination-input"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search destination (e.g. Computer Village, CMS, Ikeja)..."
            className="w-full h-11 pl-10 pr-24 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#F5B800]"
          />
          <button
            id="search-submit-btn"
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#1A1A1A] text-white text-xs font-medium hover:bg-black transition-colors"
          >
            Search
          </button>
        </form>

        {/* Query label */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <SectionLabel>Live Transit Corridors</SectionLabel>
            <p className="text-sm font-semibold text-gray-900">
              {activeQuery ? `Routes matching "${activeQuery}"` : "All Verified Routes"}
            </p>
          </div>
          {(activeQuery || selectedVehicle !== "All" || sortBy !== "cheapest") && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-[#007A62] font-semibold hover:underline"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Filter + Sort Pills (Supported backend enums: Bus, Keke, Taxi, Train) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <Pill
            active={sortBy === "cheapest"}
            onClick={() => setSortBy(sortBy === "cheapest" ? "confidence" : "cheapest")}
          >
            Sort: {sortBy === "cheapest" ? "Cheapest Fare" : "Highest Confidence"}
          </Pill>
          {["All", "bus", "keke", "taxi", "train"].map((v) => (
            <Pill
              key={v}
              active={selectedVehicle.toLowerCase() === v.toLowerCase()}
              onClick={() => setSelectedVehicle(v)}
            >
              <span className="capitalize">{v}</span>
            </Pill>
          ))}
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading search results">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : isError ? (
          <div className="p-6 bg-red-50 text-red-600 rounded-2xl text-center text-sm">
            Failed to fetch routes from server: {(error as any)?.message || "Network error"}.
            <button
              onClick={() => clearFilters()}
              className="block mx-auto mt-2 text-xs underline font-semibold"
            >
              Try resetting search
            </button>
          </div>
        ) : hasResults ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              {sortedAndFiltered.map((route) => (
                <RouteCard
                  key={route._id}
                  route={route}
                  variant="search"
                  onSelect={(r) => navigate(`/routes/${r._id || r.id}`)}
                />
              ))}
            </div>

            {/* Bottom helper card below results list (matches wireframe) */}
            <div className="flex flex-col items-center gap-2.5 pt-6 pb-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F4F1EE] flex items-center justify-center text-[#747878] shadow-2xs">
                <Map className="w-5 h-5 text-[#747878]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-[#747878] m-0">
                  Don't see your starting point?
                </p>
                <p className="text-xs text-[#A4A7A7] leading-relaxed max-w-xs m-0">
                  Try refining your search or exploring the map.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState activeQuery={activeQuery} onReset={clearFilters} />
        )}
      </main>
    </div>
  );
};

export default SearchResults;
