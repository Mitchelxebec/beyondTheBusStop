import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Map, Plus, AlertCircle } from "lucide-react";
import {
  BackButton,
  SectionLabel,
  BottomNavBar,
  RouteCard,
  RouteSearchBox,
  CreateRouteModal,
  VENDOR_NAV_ITEMS,
} from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import { useRoutes } from "../../hooks/useRoutes";
import type { LocationPlace, RouteSearchParams } from "../../types/routes";

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

// ── No Route Found Empty State (Spec Compliant) ───────────────────────────────

const NoRouteEmptyState = ({
  originName,
  destName,
  onCreateRoute,
  onReset,
}: {
  originName?: string;
  destName?: string;
  onCreateRoute: () => void;
  onReset: () => void;
}) => {
  const corridorLabel =
    originName && destName
      ? `${originName} → ${destName}`
      : destName
      ? `to ${destName}`
      : "for these locations";

  return (
    <div className="flex flex-col items-center gap-4 py-12 px-6 text-center bg-white rounded-3xl border border-black/5 shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-[#FFF4D6] flex items-center justify-center text-[#6F5400] shadow-xs">
        <AlertCircle className="w-7 h-7" />
      </div>

      <div className="flex flex-col gap-1.5 max-w-sm">
        <h3 className="text-base font-bold text-[#1C1B1B] m-0">
          No route found for this journey
        </h3>
        <p className="text-xs text-[#747878] leading-relaxed m-0">
          No transit corridors are currently listed {corridorLabel}. Would you like to create or request this route for the community?
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-xs mt-2">
        <button
          type="button"
          onClick={onCreateRoute}
          className="w-full py-3 px-4 rounded-xl bg-[#005047] text-white text-xs font-bold hover:bg-[#003B34] active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create This Route</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full py-3 px-4 rounded-xl bg-[#F5F5F0] text-[#1C1B1B] text-xs font-semibold hover:bg-neutral-200 transition-colors"
        >
          Reset & Show All
        </button>
      </div>
    </div>
  );
};

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
  const location = useLocation();
  const { session } = useAuth();
  const isBusiness = session?.role === "business";
  const [searchParams, setSearchParams] = useSearchParams();

  // Read search state from navigation state (hybrid strategy) or URL params
  const locationState = location.state as
    | { origin?: LocationPlace; destination?: LocationPlace }
    | undefined;

  const urlOriginPlaceId = searchParams.get("originPlaceId");
  const urlOriginName = searchParams.get("originName");
  const urlOriginLat = searchParams.get("originLat") ? Number(searchParams.get("originLat")) : undefined;
  const urlOriginLng = searchParams.get("originLng") ? Number(searchParams.get("originLng")) : undefined;

  const urlDestPlaceId = searchParams.get("destinationPlaceId");
  const urlDestName =
    searchParams.get("destinationName") ??
    searchParams.get("destination") ??
    searchParams.get("query") ??
    "";
  const urlDestLat = searchParams.get("destinationLat") ? Number(searchParams.get("destinationLat")) : undefined;
  const urlDestLng = searchParams.get("destinationLng") ? Number(searchParams.get("destinationLng")) : undefined;

  const initialOrigin: LocationPlace | null = locationState?.origin ?? (
    urlOriginName
      ? {
          placeId: urlOriginPlaceId ?? undefined,
          name: urlOriginName,
          latitude: urlOriginLat,
          longitude: urlOriginLng,
        }
      : null
  );

  const initialDestination: LocationPlace | null = locationState?.destination ?? (
    urlDestName
      ? {
          placeId: urlDestPlaceId ?? undefined,
          name: urlDestName,
          latitude: urlDestLat,
          longitude: urlDestLng,
        }
      : null
  );

  const [currentOrigin, setCurrentOrigin] = useState<LocationPlace | null>(initialOrigin);
  const [currentDest, setCurrentDest] = useState<LocationPlace | null>(initialDestination);
  const [sortBy, setSortBy] = useState<"cheapest" | "confidence" | "all">("cheapest");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Synchronize when URL search param changes
  useEffect(() => {
    if (urlOriginName) {
      setCurrentOrigin({
        placeId: urlOriginPlaceId ?? undefined,
        name: urlOriginName,
        latitude: urlOriginLat,
        longitude: urlOriginLng,
      });
    }
    if (urlDestName) {
      setCurrentDest({
        placeId: urlDestPlaceId ?? undefined,
        name: urlDestName,
        latitude: urlDestLat,
        longitude: urlDestLng,
      });
    }
  }, [searchParams]);

  // Construct structured query argument for useRoutes
  const searchArg: RouteSearchParams | string | undefined = useMemo(() => {
    if (
      currentOrigin?.latitude !== undefined &&
      currentOrigin?.longitude !== undefined &&
      currentDest?.latitude !== undefined &&
      currentDest?.longitude !== undefined
    ) {
      return {
        originLat: currentOrigin.latitude,
        originLng: currentOrigin.longitude,
        originName: currentOrigin.name,
        originPlaceId: currentOrigin.placeId,
        destinationLat: currentDest.latitude,
        destinationLng: currentDest.longitude,
        destinationName: currentDest.name,
        destinationPlaceId: currentDest.placeId,
        vehicleType: selectedVehicle !== "All" ? selectedVehicle : undefined,
      };
    }
    if (currentDest?.name) {
      return currentDest.name;
    }
    return undefined;
  }, [currentOrigin, currentDest, selectedVehicle]);

  // Live query: searches via GET /api/routes/search when coordinates are present, else getAllRoutes
  const { data: routes = [], isLoading, isError, error } = useRoutes(searchArg);

  const handleBoxSearch = (origin: LocationPlace, dest: LocationPlace) => {
    setCurrentOrigin(origin);
    setCurrentDest(dest);

    const params = new URLSearchParams();
    if (origin.placeId) params.set("originPlaceId", origin.placeId);
    if (origin.name) params.set("originName", origin.name);
    if (origin.latitude !== undefined) params.set("originLat", String(origin.latitude));
    if (origin.longitude !== undefined) params.set("originLng", String(origin.longitude));

    if (dest.placeId) params.set("destinationPlaceId", dest.placeId);
    if (dest.name) params.set("destinationName", dest.name);
    if (dest.latitude !== undefined) params.set("destinationLat", String(dest.latitude));
    if (dest.longitude !== undefined) params.set("destinationLng", String(dest.longitude));

    setSearchParams(params);
  };

  const clearFilters = () => {
    setCurrentOrigin(null);
    setCurrentDest(null);
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
  const isFiltered = Boolean(currentOrigin || currentDest || selectedVehicle !== "All" || sortBy !== "cheapest");

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F0]">
      {/* Top Navbar */}
      <BottomNavBar items={isBusiness ? VENDOR_NAV_ITEMS : undefined} />

      {/* Sticky header */}
      <div className="sticky top-16 z-20 bg-[#F5F5F0]/95 backdrop-blur-sm border-b border-gray-200 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 w-full mx-auto" style={{ maxWidth: "min(100%, 68rem)" }}>
          <BackButton onClick={() => navigate(-1)} />
          <span className="text-base font-bold text-gray-900">
            Route Search & Discovery
          </span>
        </div>
      </div>

      <main className="flex-1 px-4 pt-20 pb-16 flex flex-col gap-4 w-full mx-auto" style={{ maxWidth: "min(100%, 68rem)" }}>
        {/* Dual-Input Route Search Box */}
        <RouteSearchBox
          initialOrigin={currentOrigin}
          initialDestination={currentDest}
          onSearch={handleBoxSearch}
          variant="compact"
        />

        {/* Query label */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex flex-col gap-0.5">
            <SectionLabel>Transit Corridors</SectionLabel>
            <p className="text-sm font-bold text-gray-900 m-0">
              {currentOrigin && currentDest
                ? `${currentOrigin.name} → ${currentDest.name}`
                : currentDest
                ? `Routes to "${currentDest.name}"`
                : "All Verified Routes"}
            </p>
          </div>
          {isFiltered && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-[#007A62] font-semibold hover:underline"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Filter + Sort Pills (Supported backend enums: bus, keke, taxi) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <Pill
            active={sortBy === "cheapest"}
            onClick={() => setSortBy(sortBy === "cheapest" ? "confidence" : "cheapest")}
          >
            Sort: {sortBy === "cheapest" ? "Cheapest Fare" : "Highest Confidence"}
          </Pill>
          {["All", "bus", "keke", "taxi"].map((v) => (
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
          <div className="p-6 bg-red-50 text-red-600 rounded-2xl text-center text-sm border border-red-100">
            <p className="m-0 font-medium">
              Failed to fetch routes from server: {(error as any)?.message || "Network error"}.
            </p>
            <button
              onClick={() => clearFilters()}
              className="block mx-auto mt-2 text-xs underline font-semibold text-red-700"
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

            {/* Bottom helper card below results list */}
            <div className="flex flex-col items-center gap-2.5 pt-6 pb-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F4F1EE] flex items-center justify-center text-[#747878] shadow-2xs">
                <Map className="w-5 h-5 text-[#747878]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-[#747878] m-0">
                  Don't see your specific corridor?
                </p>
                <p className="text-xs text-[#A4A7A7] leading-relaxed max-w-xs m-0">
                  You can contribute new routes to help fellow commuters.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="mt-1 text-xs font-bold text-[#005047] hover:underline"
              >
                + Create a new route
              </button>
            </div>
          </div>
        ) : (
          <NoRouteEmptyState
            originName={currentOrigin?.name}
            destName={currentDest?.name}
            onCreateRoute={() => setShowCreateModal(true)}
            onReset={clearFilters}
          />
        )}
      </main>

      {/* Create Route Modal */}
      {showCreateModal && (
        <CreateRouteModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          initialOrigin={currentOrigin ?? undefined}
          initialDestination={currentDest ?? undefined}
        />
      )}
    </div>
  );
};

export default SearchResults;

