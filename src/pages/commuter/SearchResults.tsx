import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BackButton, SectionLabel, BottomNavBar } from "../../components";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Confidence = "High" | "Moderate" | "Low";

export interface RouteResult {
  id: string;
  from: string;
  to: string;
  fareLow: number;
  fareHigh: number;
  duration: string;
  confidence: Confidence;
  vehicleType?: string;
}

// ── Static route dataset ──────────────────────────────────────────────────────

const STATIC_RESULTS: RouteResult[] = [
  {
    id: "1",
    from: "Egbeda",
    to: "Ikeja / Computer Village",
    fareLow: 300,
    fareHigh: 500,
    duration: "~45 mins",
    confidence: "High",
    vehicleType: "Bus",
  },
  {
    id: "2",
    from: "Oshodi",
    to: "Ikeja / Computer Village",
    fareLow: 200,
    fareHigh: 400,
    duration: "~25 mins",
    confidence: "Moderate",
    vehicleType: "Danfo",
  },
  {
    id: "3",
    from: "Ikorodu",
    to: "Ikeja / Computer Village",
    fareLow: 500,
    fareHigh: 800,
    duration: "~70 mins",
    confidence: "Low",
    vehicleType: "Bus",
  },
  {
    id: "4",
    from: "Ojota",
    to: "CMS",
    fareLow: 300,
    fareHigh: 500,
    duration: "~35 mins",
    confidence: "High",
    vehicleType: "Bus",
  },
  {
    id: "5",
    from: "Yaba",
    to: "Obalende",
    fareLow: 250,
    fareHigh: 400,
    duration: "~30 mins",
    confidence: "High",
    vehicleType: "Bus",
  },
  {
    id: "6",
    from: "Mile 2",
    to: "Trade Fair",
    fareLow: 200,
    fareHigh: 350,
    duration: "~20 mins",
    confidence: "Moderate",
    vehicleType: "Keke",
  },
];

// ── Confidence badge ──────────────────────────────────────────────────────────

const CONFIDENCE_STYLES: Record<Confidence, { bg: string; text: string; dot: string }> = {
  High:     { bg: "bg-[#E6FAF6]", text: "text-[#007A62]", dot: "bg-[#00C9A7]" },
  Moderate: { bg: "bg-[#FFF8E6]", text: "text-[#8A6200]", dot: "bg-[#F5B800]" },
  Low:      { bg: "bg-[#FFF0F0]", text: "text-[#9B1B1B]", dot: "bg-red-400" },
};

const ConfidenceBadge = ({ level }: { level: Confidence }) => {
  const s = CONFIDENCE_STYLES[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {level} Confidence
    </span>
  );
};

// ── Route card ────────────────────────────────────────────────────────────────

const RouteCard = ({
  route,
  onViewDetails,
}: {
  route: RouteResult;
  onViewDetails: (id: string) => void;
}) => {
  const isHighConfidence = route.confidence === "High";

  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow border border-gray-100">
      {/* From / To */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-3">
          {/* Route line */}
          <div className="flex flex-col items-center pt-1 gap-1 shrink-0">
            <span className="w-3 h-3 rounded-full bg-[#1A1A1A] ring-2 ring-white ring-offset-1 shadow-xs" />
            <span className="w-0.5 h-8 bg-gray-200 rounded-full" />
            <span className="w-3 h-3 rounded-full bg-[#F5B800] ring-2 ring-white ring-offset-1 shadow-xs" />
          </div>

          <div className="flex flex-col gap-3 flex-1 min-w-0">
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">From</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">{route.from}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">To</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">{route.to}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100 mx-5" />

      {/* Fare + duration + confidence + CTA */}
      <div className="px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444748" strokeWidth="1.8" aria-hidden="true">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path strokeLinecap="round" d="M6 10h2m0 0a2 2 0 014 0m-4 0v4m4-4v4" />
            </svg>
            <span className="text-sm font-bold text-gray-900">
              ₦{route.fareLow.toLocaleString()} – ₦{route.fareHigh.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 6v6l4 2" />
            </svg>
            <span className="text-xs text-gray-500">{route.duration}</span>
            {route.vehicleType && (
              <span className="text-xs font-medium text-gray-400 px-1.5 py-0.5 rounded bg-gray-100">
                {route.vehicleType}
              </span>
            )}
          </div>
          <ConfidenceBadge level={route.confidence} />
        </div>

        <button
          type="button"
          onClick={() => onViewDetails(route.id)}
          className={`
            shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold
            transition-all duration-150 active:scale-95
            ${isHighConfidence
              ? "bg-[#F5B800] text-[#1A1A1A] shadow-[0_2px_10px_rgba(245,184,0,0.3)] hover:bg-[#FFCA28]"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
        >
          View Details
        </button>
      </div>
    </article>
  );
};

// ── Loading skeleton ──────────────────────────────────────────────────────────

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
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-5 w-24 bg-gray-100 rounded-full" />
      </div>
      <div className="h-9 w-24 bg-gray-200 rounded-xl" />
    </div>
  </div>
);

const LoadingState = () => (
  <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading search results">
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────

const EmptyState = ({ onReset }: { onReset?: () => void }) => (
  <div className="flex flex-col items-center gap-3 py-12 text-center bg-white rounded-2xl p-6 border border-gray-100">
    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4C7C7" strokeWidth="1.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    </div>
    <div className="flex flex-col gap-1">
      <p className="text-sm font-semibold text-gray-900">No matching routes found</p>
      <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
        Try refining your search keyword or resetting active filters.
      </p>
    </div>
    {onReset && (
      <button
        type="button"
        onClick={onReset}
        className="mt-2 px-4 py-2 rounded-xl bg-[#F5B800] text-[#1A1A1A] text-xs font-semibold hover:bg-[#FFCA28] transition-colors"
      >
        Reset Filters & Show All
      </button>
    )}
  </div>
);

// ── Filter / Sort pill ────────────────────────────────────────────────────────

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
      border transition-all duration-150 active:scale-95 shrink-0
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Read search query from URL (supports ?destination=... or ?query=...)
  const initialQuery = searchParams.get("destination") ?? searchParams.get("query") ?? "";

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<"fastest" | "cheapest" | "confidence">("fastest");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("All");

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
    setSortBy("fastest");
    setSearchParams({});
  };

  // Filter & Sort Logic
  const sortedAndFiltered = useMemo(() => {
    return STATIC_RESULTS.filter(route => {
      if (activeQuery) {
        const q = activeQuery.toLowerCase();
        const matchFrom = route.from.toLowerCase().includes(q);
        const matchTo = route.to.toLowerCase().includes(q);
        if (!matchFrom && !matchTo) return false;
      }
      if (selectedVehicle !== "All" && route.vehicleType) {
        if (route.vehicleType.toLowerCase() !== selectedVehicle.toLowerCase()) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "fastest") return parseInt(a.duration) - parseInt(b.duration);
      if (sortBy === "cheapest") return a.fareLow - b.fareLow;
      if (sortBy === "confidence") {
        const score = { High: 3, Moderate: 2, Low: 1 };
        return score[b.confidence] - score[a.confidence];
      }
      return 0;
    });
  }, [activeQuery, selectedVehicle, sortBy]);

  const isLoading = false;
  const hasResults = sortedAndFiltered.length > 0;

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F0]">
      {/* Top Navbar */}
      <BottomNavBar />

      {/* Sticky header */}
      <div className="sticky top-14 z-20 bg-[#F5F5F0]/95 backdrop-blur-sm border-b border-gray-200 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <BackButton onClick={() => navigate(-1)} />
          <span className="text-base font-semibold text-gray-900">Search Results</span>
        </div>
      </div>

      <main className="flex-1 px-4 pt-4 pb-16 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="8" cy="8" r="5.5" stroke="#747878" strokeWidth="1.5" />
              <path d="M12.5 12.5L15.5 15.5" stroke="#747878" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search destination (e.g. Computer Village, CMS)..."
            className="w-full h-11 pl-10 pr-24 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#F5B800]"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#1A1A1A] text-white text-xs font-medium hover:bg-black transition-colors"
          >
            Search
          </button>
        </form>

        {/* Query label */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <SectionLabel>Search Results</SectionLabel>
            <p className="text-sm font-semibold text-gray-900">
              {activeQuery ? `Routes matching "${activeQuery}"` : "All Available Routes"}
            </p>
          </div>
          {(activeQuery || selectedVehicle !== "All" || sortBy !== "fastest") && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-[#007A62] font-semibold hover:underline"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Filter + Sort Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <Pill
            active={sortBy === "fastest"}
            onClick={() => setSortBy(sortBy === "fastest" ? "cheapest" : "fastest")}
          >
            Sort: {sortBy === "fastest" ? "Fastest" : sortBy === "cheapest" ? "Cheapest" : "Confidence"}
          </Pill>
          {["All", "Bus", "Danfo", "Keke"].map((v) => (
            <Pill
              key={v}
              active={selectedVehicle === v}
              onClick={() => setSelectedVehicle(v)}
            >
              {v}
            </Pill>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingState />
        ) : hasResults ? (
          <div className="flex flex-col gap-4">
            {sortedAndFiltered.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                onViewDetails={(id) => navigate(`/routes/${id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState onReset={clearFilters} />
        )}
      </main>
    </div>
  );
};

export default SearchResults;
