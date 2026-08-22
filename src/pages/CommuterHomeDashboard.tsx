import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  MapPin,
  MapPinOff,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  BottomNavBar,
  SectionLabel,
  RouteCard,
  RouteSearchBox,
  NearbyEssentialsSection,
} from "../components";
import { useAuth } from "../contexts/AuthContext";
import { useRoutes } from "../hooks/useRoutes";
import { getMergedNearbyEssentials } from "../services/locations";
import type { LocationPlace } from "../types/routes";

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
    <span className="text-[#1C1B1B] text-sm leading-6 font-semibold">{query}</span>
  </button>
);

// ─── Main Component ────────────────────────────────────────────────────────────

/**
 * CommuterHomeDashboard
 *
 * Figma node 178:248 — "Commuter Home Dashboard".
 * Shows quick routes, live nearby essentials based on user's current GPS location, and recent searches.
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

  // ── Search navigation ───────────────────────────────────────────────────────
  const [recentSearches, setRecentSearches] = useState<string[]>(
    loadRecentSearches
  );

  const handleRouteSearch = (origin: LocationPlace, destination: LocationPlace) => {
    const label = `${origin.name} → ${destination.name}`;
    setRecentSearches(saveRecentSearch(label));

    const params = new URLSearchParams();
    if (origin.placeId) params.set("originPlaceId", origin.placeId);
    if (origin.name) params.set("originName", origin.name);
    if (origin.latitude !== undefined) params.set("originLat", String(origin.latitude));
    if (origin.longitude !== undefined) params.set("originLng", String(origin.longitude));

    if (destination.placeId) params.set("destinationPlaceId", destination.placeId);
    if (destination.name) params.set("destinationName", destination.name);
    if (destination.latitude !== undefined) params.set("destinationLat", String(destination.latitude));
    if (destination.longitude !== undefined) params.set("destinationLng", String(destination.longitude));

    navigate(`/search?${params.toString()}`, {
      state: { origin, destination },
    });
  };

  const handleRecentClick = (query: string) => {
    if (query.includes("→")) {
      const [orig, dest] = query.split("→").map((s) => s.trim());
      navigate(
        `/search?originName=${encodeURIComponent(orig)}&destinationName=${encodeURIComponent(dest)}`
      );
    } else {
      navigate(`/search?destinationName=${encodeURIComponent(query)}`);
    }
  };

  // ── Data queries ────────────────────────────────────────────────────────────

  const {
    data: displayedRoutes = [],
    isLoading: routesLoading,
    isError: routesError,
  } = useRoutes();

  // ── Browser Geolocation State (Rule 6, 7, 8, 9) ────────────────────────────
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoState, setGeoState] = useState<"idle" | "requesting" | "denied" | "unavailable" | "ready">("requesting");
  const [isAllEssentialsExpanded, setIsAllEssentialsExpanded] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoState("unavailable");
      return;
    }
    setGeoState("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGeoState("ready");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoState("denied");
        } else {
          setGeoState("unavailable");
        }
      },
      { timeout: 10000, enableHighAccuracy: false, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // ── Structurally Distinct React Query Key & Throttling Caching ──────────────
  // Precision rounded to 3 decimal places (~110m) to throttle minor GPS drift
  const roundedLat = geoCoords ? Math.round(geoCoords.lat * 1000) / 1000 : null;
  const roundedLng = geoCoords ? Math.round(geoCoords.lng * 1000) / 1000 : null;

  const {
    data: liveNearbyPlaces = [],
    isLoading: isNearbyLoading,
    isError: isNearbyError,
    refetch: refetchNearby,
  } = useQuery({
    queryKey: ["nearby-essentials", "dashboard", roundedLat, roundedLng],
    queryFn: () => getMergedNearbyEssentials(geoCoords!, geoCoords!),
    enabled: Boolean(geoCoords?.lat && geoCoords?.lng && geoState === "ready"),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,    // 15 minutes
  });

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
        style={{ maxWidth: "min(100%, 68rem)" }}
        aria-label="Home dashboard content"
      >
        <div className="flex flex-col gap-6 px-4 sm:px-6 pt-8 pb-12">

          {/* 1 · Greeting ─────────────────────────────────────────────── */}
          <section aria-labelledby="greeting-heading" className="flex flex-col gap-1">
            <h1
              id="greeting-heading"
              className="text-[#1C1B1B] text-2xl leading-tight font-extrabold m-0"
            >
              {greeting}
            </h1>
            <p className="text-[#747878] text-sm leading-6 font-medium m-0">
              Lagos is moving fast today. Where to?
            </p>
          </section>

          {/* 2 · Dual-Input Route Search Box ─────────────────────────── */}
          <section aria-label="Search for transit routes">
            <RouteSearchBox onSearch={handleRouteSearch} />
          </section>

          {/* 3 · Routes ───────────────────────────────────────────────── */}
          <section aria-labelledby="routes-heading" className="flex flex-col gap-3">
            <SectionLabel
              variant="page"
              action={
                <button
                  id="view-all-routes-btn"
                  onClick={() => navigate("/routes")}
                  aria-label="View all routes"
                  className="text-[#005047] text-xs font-bold hover:underline transition-colors cursor-pointer"
                >
                  View All
                </button>
              }
            >
              Quick Routes
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
                No routes available yet.
              </p>
            )}

            <div className="flex flex-col gap-3">
              {displayedRoutes.map((route) => (
                <RouteCard
                  key={route._id}
                  route={route}
                  onSelect={(r) => navigate(`/routes/${r._id || r.id}`)}
                />
              ))}
            </div>
          </section>

          {/* 4 · Live Nearby Essentials (Google Places + Live Corridor Vendors) ── */}
          <section aria-labelledby="nearby-essentials-heading" className="flex flex-col gap-3">
            <SectionLabel variant="page">Nearby Essentials</SectionLabel>

            {/* State A: Requesting Geolocation */}
            {geoState === "requesting" && (
              <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-2xs flex items-center justify-center gap-3 text-xs text-[#747878]">
                <Loader2 className="w-4 h-4 text-[#005047] animate-spin" />
                <span>Locating nearby hospitals, police stations, and merchants…</span>
              </div>
            )}

            {/* State B: Permission Denied */}
            {geoState === "denied" && (
              <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FCE8E6] text-[#BA1A1A] flex items-center justify-center shrink-0">
                    <MapPinOff className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#1C1B1B] block">Location Permission Denied</span>
                    <p className="text-[#747878] m-0 mt-0.5 text-[11px] leading-relaxed">
                      Enable location access in your browser settings to discover verified safety points and vendors near you.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="retry-location-permission-btn"
                  onClick={requestLocation}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#005047] text-white text-xs font-semibold hover:bg-[#003831] active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* State C: Position Unavailable / Unsupported */}
            {geoState === "unavailable" && (
              <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF4D6] text-[#6F5400] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#1C1B1B] block">Location Unavailable</span>
                    <p className="text-[#747878] m-0 mt-0.5 text-[11px] leading-relaxed">
                      Unable to determine your current GPS location. Please check your device location services or network.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="retry-location-unavailable-btn"
                  onClick={requestLocation}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#005047] text-white text-xs font-semibold hover:bg-[#003831] active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* State D: Geolocation Ready + Data Fetch Error */}
            {geoState === "ready" && isNearbyError && (
              <div className="bg-[#FCE8E6]/40 rounded-2xl p-5 border border-[#BA1A1A]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FCE8E6] text-[#BA1A1A] flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#BA1A1A] block">Unable to Load Nearby Places</span>
                    <p className="text-[#747878] m-0 mt-0.5 text-[11px] leading-relaxed">
                      Could not fetch nearby essentials due to a network timeout or connection error.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="retry-nearby-fetch-btn"
                  onClick={() => refetchNearby()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#005047] text-white text-xs font-semibold hover:bg-[#003831] active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* State E: Geolocation Ready + Display Real Nearby Essentials */}
            {geoState === "ready" && !isNearbyError && (
              <NearbyEssentialsSection
                places={liveNearbyPlaces}
                isLoading={isNearbyLoading}
                destName="your current area"
                maxItems={isAllEssentialsExpanded ? undefined : 4}
                showHeader={false}
                onViewAll={() => setIsAllEssentialsExpanded(true)}
              />
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
    </div>
  );
};

export default CommuterHomeDashboard;
