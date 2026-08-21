import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import {
  BottomNavBar,
  PageHeader,
  BackButton,
  SecondaryButton,
  VENDOR_NAV_ITEMS,
  NearbyEssentialsSection,
  type EssentialsCategoryFilter,
} from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import { useRouteById } from "../../hooks/useRoutes";
import { getRoutePlaceName } from "../../types/routes";
import {
  resolveCoordinates,
  getMergedNearbyEssentials,
} from "../../services/locations";

/**
 * RouteNearbyEssentials Page Component
 *
 * Dedicated full screen for all Nearby Essentials along a transit route corridor.
 * Displays the complete filtered list (without the 6-item cap), preserving filter selection.
 * Route: /routes/:id/nearby-essentials
 */
const RouteNearbyEssentials = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const isBusiness = session?.role === "business";

  // Read initial filter from navigation state (e.g. from View All click on RouteDetails)
  const locationState = location.state as
    | { activeFilter?: EssentialsCategoryFilter }
    | undefined;
  const initialFilter = locationState?.activeFilter || "all";

  // ── 1. Fetch Route Corridor Details ─────────────────────────────────────────
  const {
    data: route,
    isLoading: isRouteLoading,
    isError: isRouteError,
    error: routeError,
  } = useRouteById(id);

  const originName = getRoutePlaceName(route?.origin);
  const destName = getRoutePlaceName(route?.destination);

  // ── 2. Resolve Geographic Coordinates ───────────────────────────────────────
  const [coords, setCoords] = useState<{
    origin: { lat: number; lng: number };
    dest: { lat: number; lng: number };
  }>({
    origin: { lat: 0, lng: 0 },
    dest: { lat: 0, lng: 0 },
  });

  useEffect(() => {
    let isMounted = true;
    if (originName && destName) {
      Promise.all([
        resolveCoordinates(originName),
        resolveCoordinates(destName),
      ]).then(([oCoords, dCoords]) => {
        if (isMounted) {
          setCoords({ origin: oCoords, dest: dCoords });
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [originName, destName]);

  // ── 3. Live Nearby Essentials Query (Google Places + Live Vendors) ──────────
  const { data: liveNearbyPlaces = [], isLoading: isNearbyLoading } = useQuery({
    queryKey: [
      "nearby-essentials",
      coords.origin.lat,
      coords.origin.lng,
      coords.dest.lat,
      coords.dest.lng,
    ],
    queryFn: () => getMergedNearbyEssentials(coords.origin, coords.dest),
    enabled: Boolean(coords.origin.lat && coords.dest.lat),
  });

  // ── 4. Loading & Error States ───────────────────────────────────────────────
  if (isRouteLoading) {
    return (
      <div className="flex flex-col min-h-dvh bg-[#FDFAF8]">
        <BottomNavBar items={isBusiness ? VENDOR_NAV_ITEMS : undefined} />
        <main className="flex-1 w-full mx-auto pt-16 px-4 max-w-xl flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-[#005047]/20 border-t-[#005047] rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#1C1B1B]">
            Loading nearby essentials…
          </p>
        </main>
      </div>
    );
  }

  if (isRouteError || !route) {
    return (
      <div className="flex flex-col min-h-dvh bg-[#FDFAF8]">
        <BottomNavBar items={isBusiness ? VENDOR_NAV_ITEMS : undefined} />
        <main className="flex-1 w-full mx-auto pt-16 px-4 max-w-xl flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FCE8E6] flex items-center justify-center text-[#BA1A1A]">
            <X className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#1C1B1B] m-0">Route Not Found</h2>
          <p className="text-xs text-[#747878] max-w-xs m-0">
            {routeError?.message ||
              "The requested route corridor could not be loaded."}
          </p>
          <div className="pt-2">
            <SecondaryButton onClick={() => navigate("/routes")} width="auto">
              Explore Available Routes
            </SecondaryButton>
          </div>
        </main>
      </div>
    );
  }

  const corridorSubtitle =
    originName && destName ? `${originName} → ${destName}` : undefined;

  return (
    <div className="flex flex-col min-h-dvh bg-[#FDFAF8] text-[#1C1B1B]">
      {/* ── Fixed Top Navigation Bar ──────────────────────────────────────── */}
      <BottomNavBar items={isBusiness ? VENDOR_NAV_ITEMS : undefined} />

      {/* ── Main Content Container ────────────────────────────────────────── */}
      <main
        id="nearby-essentials-main"
        className="flex-1 w-full mx-auto pt-16"
        style={{ maxWidth: "min(100%, 68rem)" }}
        aria-label="All Nearby Essentials Along Route"
      >
        <div className="flex flex-col gap-5 px-4 sm:px-6 pt-5 pb-16">
          {/* Header Title with Back Button */}
          <PageHeader
            title="Nearby Essentials"
            className="px-0 pt-0 pb-0"
            leading={
              <BackButton
                onClick={() => {
                  if (id) {
                    navigate(`/routes/${id}`);
                  } else {
                    navigate(-1);
                  }
                }}
                aria-label="Back to route details"
              />
            }
          />

          {corridorSubtitle && (
            <div className="flex items-center gap-2 -mt-2">
              <span className="text-xs font-semibold text-[#005047] bg-[#005047]/10 px-2.5 py-1 rounded-full">
                {corridorSubtitle}
              </span>
            </div>
          )}

          {/* ── Full Uncapped Essentials Section with Filter Pills ───────── */}
          <NearbyEssentialsSection
            places={liveNearbyPlaces}
            isLoading={isNearbyLoading}
            destName={destName}
            initialFilter={initialFilter}
            showHeader={false}
          />
        </div>
      </main>
    </div>
  );
};

export default RouteNearbyEssentials;
