import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BottomNavBar, SectionLabel, BackButton } from "../components";
import type { NavItem } from "../components/BottomNavBar";
import type { Route, ConfidenceLevel } from "../types/routes";

// ─── Nav items (reused exact navbar structure from CommuterHomeDashboard) ──────

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

const NAV_ITEMS: NavItem[] = [
  { label: "Home",    path: "/home",    icon: <HomeNavIcon /> },
  { label: "Routes",  path: "/routes",  icon: <RoutesNavIcon /> },
  { label: "Share",   path: "/share",   icon: <ShareNavIcon /> },
  { label: "Profile", path: "/profile", icon: <ProfileNavIcon /> },
];

// ─── Icons ──────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="5.5" stroke="#747878" strokeWidth="1.5" />
    <path d="M12.5 12.5L15.5 15.5" stroke="#747878" strokeWidth="1.5" strokeLinecap="round" />
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

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 4H14M4 8H12M6 12H10" stroke="#444748" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// ─── Confidence Badge ──────────────────────────────────────────────────────────

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

// ─── Static / Placeholder Data (Data Mode B requirement) ──────────────────────
// TODO: Replace with real API query:
// const { data, isLoading, error } = useQuery({ queryKey: ["routes", "search", query], queryFn: () => searchRoutes(query) });

const PLACEHOLDER_ROUTES: Route[] = [
  {
    _id: "placeholder-1",
    origin: "Ojota",
    destination: "CMS",
    vehicleType: "bus",
    fareLow: 300,
    fareHigh: 500,
    averageFare: 400,
    confidenceLevel: "High",
    confidenceScore: 92,
    createdBy: "admin",
  },
  {
    _id: "placeholder-2",
    origin: "Ikeja",
    destination: "Victoria Island",
    vehicleType: "bus",
    fareLow: 500,
    fareHigh: 800,
    averageFare: 650,
    confidenceLevel: "High",
    confidenceScore: 88,
    createdBy: "admin",
  },
  {
    _id: "placeholder-3",
    origin: "Oshodi",
    destination: "Lekki Phase 1",
    vehicleType: "Danfo",
    fareLow: 400,
    fareHigh: 700,
    averageFare: 550,
    confidenceLevel: "Medium",
    confidenceScore: 74,
    createdBy: "vendor-1",
  },
  {
    _id: "placeholder-4",
    origin: "Yaba",
    destination: "Obalende",
    vehicleType: "bus",
    fareLow: 250,
    fareHigh: 400,
    averageFare: 300,
    confidenceLevel: "High",
    confidenceScore: 95,
    createdBy: "admin",
  },
  {
    _id: "placeholder-5",
    origin: "Mile 2",
    destination: "Trade Fair",
    vehicleType: "keke",
    fareLow: 200,
    fareHigh: 350,
    averageFare: 250,
    confidenceLevel: "High",
    confidenceScore: 90,
    createdBy: "admin",
  },
  {
    _id: "placeholder-6",
    origin: "Maryland",
    destination: "Allen Avenue",
    vehicleType: "keke",
    fareLow: 150,
    fareHigh: 300,
    averageFare: 200,
    confidenceLevel: "Low",
    confidenceScore: 45,
    createdBy: "vendor-2",
  },
  {
    _id: "placeholder-7",
    origin: "Ebute Metta",
    destination: "Idumota",
    vehicleType: "taxi",
    fareLow: 1000,
    fareHigh: 1500,
    averageFare: 1200,
    confidenceLevel: "Medium",
    confidenceScore: 68,
    createdBy: "admin",
  },
  {
    _id: "placeholder-8",
    origin: "Ikorodu",
    destination: "TBS",
    vehicleType: "train",
    fareLow: 600,
    fareHigh: 1000,
    averageFare: 800,
    confidenceLevel: "High",
    confidenceScore: 96,
    createdBy: "admin",
  },
];

// ─── Main Component ────────────────────────────────────────────────────────────

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read search query from URL (supports ?destination=... or ?query=...)
  const initialQuery = searchParams.get("destination") ?? searchParams.get("query") ?? "";

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("All");
  const [selectedConfidence, setSelectedConfidence] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"fareAsc" | "fareDesc" | "confidence">("fareAsc");

  // Handle Search Submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchInput.trim();
    setActiveQuery(trimmed);
    if (trimmed) {
      setSearchParams({ destination: trimmed });
    } else {
      setSearchParams({});
    }
  };

  // Filter & Sort Logic on Placeholder Data
  const filteredRoutes = useMemo(() => {
    return PLACEHOLDER_ROUTES.filter((route) => {
      // Query filter (matches destination or origin)
      if (activeQuery) {
        const q = activeQuery.toLowerCase();
        const matchOrigin = route.origin.toLowerCase().includes(q);
        const matchDest = route.destination.toLowerCase().includes(q);
        if (!matchOrigin && !matchDest) return false;
      }

      // Vehicle type filter
      if (selectedVehicle !== "All") {
        if (selectedVehicle.toLowerCase() === "danfo") {
          if (route.vehicleType.toLowerCase() !== "danfo" && route.vehicleType.toLowerCase() !== "bus") {
            return false;
          }
        } else if (route.vehicleType.toLowerCase() !== selectedVehicle.toLowerCase()) {
          return false;
        }
      }

      // Confidence level filter
      if (selectedConfidence !== "All" && route.confidenceLevel !== selectedConfidence) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "fareAsc") return a.fareLow - b.fareLow;
      if (sortBy === "fareDesc") return b.fareHigh - a.fareHigh;
      if (sortBy === "confidence") {
        return (b.confidenceScore ?? 0) - (a.confidenceScore ?? 0);
      }
      return 0;
    });
  }, [activeQuery, selectedVehicle, selectedConfidence, sortBy]);

  const clearFilters = () => {
    setSearchInput("");
    setActiveQuery("");
    setSelectedVehicle("All");
    setSelectedConfidence("All");
    setSortBy("fareAsc");
    setSearchParams({});
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#FDFAF8]">
      {/* ── Top navbar ──────────────────────────────────────────────────── */}
      <BottomNavBar items={NAV_ITEMS} />

      {/* ── Main Container (Responsive width) ───────────────────────────── */}
      <main
        id="search-results-main"
        className="flex-1 w-full mx-auto pt-16"
        style={{ maxWidth: "min(100%, 42rem)" }}
        aria-label="Search results content"
      >
        <div className="flex flex-col gap-5 px-4 sm:px-6 pt-6 pb-12">

          {/* 1 · Header Row with Back Button ───────────────────────────── */}
          <div className="flex items-center gap-3">
            <BackButton onClick={() => navigate(-1)} label="Back" />
            <div className="flex flex-col">
              <h1 className="text-[#1C1B1B] text-lg font-semibold m-0 leading-tight">
                Search Results
              </h1>
              <p className="text-[#444748] text-xs font-normal m-0">
                {activeQuery ? `Routes matching "${activeQuery}"` : "Explore all Lagos transit routes"}
              </p>
            </div>
          </div>

          {/* 2 · Search Input Bar ──────────────────────────────────────── */}
          <form onSubmit={handleSearch} className="relative flex items-center">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
              <SearchIcon />
            </span>
            <input
              id="search-results-input"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search destination or route (e.g. CMS, Ikeja)..."
              aria-label="Search destination or route"
              className="w-full h-11 pl-10 pr-20 rounded-xl bg-[#E5E2E1] text-sm leading-5 text-[#1C1B1B] placeholder:text-[#8E9192] outline-none focus:ring-2 focus:ring-[#79F7E3]/60 transition-shadow"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#1C1B1B] text-white text-xs font-medium hover:bg-black transition-colors"
            >
              Search
            </button>
          </form>

          {/* 3 · Filter Chips Bar ──────────────────────────────────────── */}
          <section aria-label="Route filters" className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#444748]">
                <FilterIcon />
                <span>Filters & Sorting</span>
              </div>

              {(activeQuery || selectedVehicle !== "All" || selectedConfidence !== "All") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-[#59DBC7] font-medium hover:underline"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Vehicle Type Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <span className="text-[11px] font-semibold text-[#747878] shrink-0">Vehicle:</span>
              {["All", "Bus", "Keke", "Taxi", "Train"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSelectedVehicle(v)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                    selectedVehicle === v
                      ? "bg-[#1C1B1B] text-white"
                      : "bg-[#EBE7E6] text-[#444748] hover:bg-[#E0DCDB]"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Confidence & Sorting Controls */}
            <div className="flex items-center gap-3 justify-between text-xs flex-wrap pt-1">
              {/* Confidence Select */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#747878]">Confidence:</span>
                <select
                  value={selectedConfidence}
                  onChange={(e) => setSelectedConfidence(e.target.value)}
                  className="bg-[#EBE7E6] border-none text-[#1C1B1B] text-xs font-medium rounded-lg px-2.5 py-1 outline-none cursor-pointer"
                >
                  <option value="All">All Levels</option>
                  <option value="High">High Confidence</option>
                  <option value="Medium">Medium Confidence</option>
                  <option value="Low">Low Confidence</option>
                </select>
              </div>

              {/* Sort Order Select */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#747878]">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#EBE7E6] border-none text-[#1C1B1B] text-xs font-medium rounded-lg px-2.5 py-1 outline-none cursor-pointer"
                >
                  <option value="fareAsc">Lowest Fare (₦)</option>
                  <option value="fareDesc">Highest Fare (₦)</option>
                  <option value="confidence">Highest Confidence</option>
                </select>
              </div>
            </div>
          </section>

          {/* 4 · Results List Section ───────────────────────────────────── */}
          <section aria-labelledby="results-section-heading" className="flex flex-col gap-3 pt-2">
            <SectionLabel variant="page">
              {filteredRoutes.length === 1
                ? "1 Route Found"
                : `${filteredRoutes.length} Routes Found`}
            </SectionLabel>

            {/* Empty State */}
            {filteredRoutes.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center border border-neutral-100 flex flex-col items-center gap-3 my-4">
                <div className="w-12 h-12 rounded-full bg-[#FFF4D6] flex items-center justify-center text-[#6F5400] text-xl font-bold">
                  !
                </div>
                <h3 className="text-base font-semibold text-[#1C1B1B] m-0">No matching routes</h3>
                <p className="text-xs text-[#444748] m-0 max-w-xs leading-relaxed">
                  We couldn't find any transit routes matching your search criteria. Try resetting filters or searching another destination.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#FFC72C] text-[#1C1B1B] text-xs font-semibold hover:brightness-95 transition-all"
                >
                  Reset Filters & Show All
                </button>
              </div>
            )}

            {/* Route Cards */}
            <div className="flex flex-col gap-3">
              {filteredRoutes.map((route) => (
                <article
                  key={route._id}
                  className="relative flex items-center bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-shadow border border-neutral-100"
                >
                  {/* Left accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#79F7E3] rounded-l-xl" aria-hidden="true" />

                  <div className="flex items-center justify-between w-full pl-5 pr-3 py-3 gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                      {/* Origin → Destination */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#1C1B1B] text-base leading-6 font-semibold truncate">
                          {route.origin}
                        </span>
                        <ArrowRightSmallIcon />
                        <span className="text-[#1C1B1B] text-base leading-6 font-semibold truncate">
                          {route.destination}
                        </span>
                      </div>

                      {/* Confidence + vehicle type + fare range */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <ConfidenceBadge level={route.confidenceLevel} />
                        <span className="text-[#444748] text-xs leading-5 capitalize font-medium">
                          {route.vehicleType}
                        </span>
                        <span className="text-[#444748] text-xs leading-5 font-semibold">
                          ₦{route.fareLow.toLocaleString()} – ₦{route.fareHigh.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      id={`navigate-search-route-${route._id}`}
                      onClick={() => navigate(`/routes/${route._id}`)}
                      aria-label={`View details for route from ${route.origin} to ${route.destination}`}
                      className="shrink-0 w-10 h-10 rounded-full bg-[#FFC72C] flex items-center justify-center transition-transform active:scale-95 hover:brightness-95"
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
    </div>
  );
};

export default SearchResults;
