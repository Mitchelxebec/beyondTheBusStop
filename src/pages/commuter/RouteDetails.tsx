import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Share2,
  ArrowRight,
  TrendingUp,
  Coins,
  X,
  Clock,
  Bookmark,
} from "lucide-react";
import {
  BottomNavBar,
  PageHeader,
  BackButton,
  ConfidenceBadge,
  PrimaryButton,
  SecondaryButton,
  Toast,
  VENDOR_NAV_ITEMS,
  NearbyEssentialsSection,
} from "../../components";
import RouteMap from "../../components/RouteMap";
import { useAuth } from "../../contexts/AuthContext";
import { useRouteById } from "../../hooks/useRoutes";
import { getRoutePlaceName, formatFareRange, formatTimeAgo } from "../../types/routes";
import {
  isRouteSaved,
  saveRouteId,
  removeRouteId,
} from "../../services/savedRoutes";
import {
  resolveCoordinates,
  getMergedNearbyEssentials,
} from "../../services/locations";


/**
 * RouteDetails Page Component
 *
 * Dedicated Route Details screen matching Figma node 178:1151.
 * Connects live transit route corridors, Leaflet OpenStreetMap visualizer,
 * Google Places proximity essentials (origin & destination), static vendor placeholders,
 * and live trip-share link generation + simulated email sharing.
 */
const RouteDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const isBusiness = session?.role === "business";

  // ── 1. Fetch Route Details from Live Backend ────────────────────────────────
  const {
    data: route,
    isLoading: isRouteLoading,
    isError: isRouteError,
    error: routeError,
  } = useRouteById(id);

  // Extract names safely (supporting both object and string representations)
  const originName = getRoutePlaceName(route?.origin);
  const destName = getRoutePlaceName(route?.destination);
  const boardingName = getRoutePlaceName(route?.boardingPoint) || originName;
  const transferName = getRoutePlaceName(route?.transferPoint);
  const dropOffName = getRoutePlaceName(route?.dropOffPoint) || destName;

  // ── Saved Route (Bookmark) State ────────────────────────────────────────────
  const userId = session?.user?._id || session?.user?.id;
  const routeIdToTrack = route?._id || id;
  const [isSaved, setIsSaved] = useState<boolean>(() => isRouteSaved(routeIdToTrack, userId));
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (routeIdToTrack) {
      setIsSaved(isRouteSaved(routeIdToTrack, userId));
    }
  }, [routeIdToTrack, userId]);

  const handleToggleSave = () => {
    if (!routeIdToTrack) return;
    if (isSaved) {
      removeRouteId(routeIdToTrack, userId);
      setIsSaved(false);
      setToastMessage("Route removed from saved list");
    } else {
      saveRouteId(routeIdToTrack, userId);
      setIsSaved(true);
      setToastMessage("Route bookmarked to saved routes");
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── 2. Coordinates Resolution for Origin & Destination ──────────────────────
  const [coords, setCoords] = useState<{
    origin: { lat: number; lng: number };
    dest: { lat: number; lng: number };
  }>({
    origin: { lat: 6.5538, lng: 3.3552 },
    dest: { lat: 6.6018, lng: 3.3515 },
  });

  useEffect(() => {
    let isMounted = true;
    if (originName || destName) {
      Promise.all([
        resolveCoordinates(originName || "Oshodi"),
        resolveCoordinates(destName || "Ikeja"),
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

  // ── 3. Live Nearby Essentials Query (Concurrent Origin & Destination + Live Vendors) ─
  const { data: liveNearbyPlaces = [], isLoading: isNearbyLoading } = useQuery({
    queryKey: ["nearby-essentials", coords.origin.lat, coords.origin.lng, coords.dest.lat, coords.dest.lng],
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
          <p className="text-sm font-semibold text-[#1C1B1B]">Loading route corridor details…</p>
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
            {routeError?.message || "The requested route corridor could not be loaded or may have been removed."}
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

  // ── 6. Render Full Route Details ────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-dvh bg-[#FDFAF8] text-[#1C1B1B]">
      {/* ── Fixed Top Navigation Bar ──────────────────────────────────────── */}
      <BottomNavBar items={isBusiness ? VENDOR_NAV_ITEMS : undefined} />

      {/* ── Main Content Container ────────────────────────────────────────── */}
      <main
        id="route-details-main"
        className="flex-1 w-full mx-auto pt-16"
        style={{ maxWidth: "min(100%, 68rem)" }}
        aria-label="Route Details & Corridor Information"
      >
        <div className="flex flex-col gap-5 px-4 sm:px-6 pt-5 pb-16">
          {/* Header Title with Back Button & Share Action */}
          <PageHeader
            title="Route Details"
            className="px-0 pt-0 pb-0"
            leading={
              <BackButton
                onClick={() => navigate(-1)}
                aria-label="Go back to previous page"
              />
            }
            trailing={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="toggle-save-route-btn"
                  onClick={handleToggleSave}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-95 shadow-2xs cursor-pointer ${
                    isSaved
                      ? "bg-[#FFF8E6] border-[#FFC72C]/80 text-[#B88A00]"
                      : "bg-white border-neutral-200 text-[#747878] hover:text-[#1C1B1B] hover:bg-neutral-50"
                  }`}
                  aria-label={isSaved ? "Remove from saved routes" : "Save this route"}
                  title={isSaved ? "Saved in bookmarks" : "Save route"}
                >
                  <Bookmark
                    className={`w-4 h-4 transition-transform ${
                      isSaved ? "fill-[#FFC72C] text-[#B88A00] scale-105" : "text-[#747878]"
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/share", {
                    state: {
                      origin: originName,
                      destination: destName,
                      fare: formatFareRange(route.fareLow, route.fareHigh),
                      routeId: route._id,
                    }
                  })}
                  className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-[#1C1B1B] hover:bg-neutral-50 transition-colors shadow-2xs"
                  aria-label="Share trip details"
                  title="Share Trip"
                >
                  <Share2 className="w-4 h-4 text-[#005047]" />
                </button>
              </div>
            }
          />

          {/* 1 · Live Leaflet Map Visualizer (OpenStreetMap — fully functional) */}
          <section aria-label="Route corridor map" className="flex flex-col gap-2">
            <RouteMap
              originName={originName}
              destinationName={destName}
              boardingPointName={boardingName}
              dropOffPointName={dropOffName}
              originCoords={coords.origin}
              destinationCoords={coords.dest}
              vehicleType={route.vehicleType}
            />
          </section>

          {/* 2 · Corridor Overview & Fares Bento Card ─────────────────────── */}
          <section
            aria-labelledby="corridor-summary-heading"
            className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col gap-4"
          >
            {/* Origin -> Destination Header */}
            <div className="flex flex-col gap-1.5 border-b border-neutral-100 pb-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#59DBC7]">
                  Verified Transit Corridor
                </span>
                <ConfidenceBadge level={route.confidenceLevel} />
              </div>
              <h1 id="corridor-summary-heading" className="text-xl sm:text-2xl font-bold text-[#1C1B1B] m-0 flex items-center gap-2 flex-wrap">
                <span>{originName}</span>
                <ArrowRight className="w-5 h-5 text-[#C4C7C7] shrink-0" aria-hidden="true" />
                <span>{destName}</span>
              </h1>
              {route.createdAt && (
                <div className="flex items-center gap-1.5 text-xs text-[#747878] mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-[#005047]" />
                  <span>Added {formatTimeAgo(route.createdAt)}</span>
                </div>
              )}
            </div>

            {/* Fare & Mode Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#F9F8F6] p-3.5 rounded-xl border border-black/5">
              {/* Metric 1: Fare Range */}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#747878] flex items-center gap-1">
                  <Coins className="w-3 h-3 text-[#FFC72C]" /> Estimated Fare
                </span>
                <span className="text-base sm:text-lg font-black text-[#1C1B1B]">
                  {formatFareRange(route.fareLow, route.fareHigh)}
                </span>
                <span className="text-[10px] text-[#747878]">Standard fare window</span>
              </div>

              {/* Metric 2: Average Confirmed Fare */}
              <div className="flex flex-col border-l border-neutral-200/80 pl-3">
                <span className="text-[10px] uppercase font-bold text-[#747878] flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-[#005047]" /> Avg. Confirmed
                </span>
                <span className="text-base sm:text-lg font-black text-[#005047]">
                  {typeof route.averageFare === "number"
                    ? `₦${route.averageFare.toLocaleString()}`
                    : typeof route.fareLow === "number" && typeof route.fareHigh === "number"
                    ? `₦${Math.round((route.fareLow + route.fareHigh) / 2).toLocaleString()}`
                    : "—"}
                </span>
                <span className="text-[10px] text-[#005047] font-medium">
                  {route.totalConfirmations ? `${route.totalConfirmations} confirmations` : "Community verified"}
                </span>
              </div>

              {/* Metric 3: Transit Mode */}
              <div className="col-span-2 sm:col-span-1 flex flex-col sm:border-l sm:border-neutral-200/80 sm:pl-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200/60">
                <span className="text-[10px] uppercase font-bold text-[#747878]">
                  Transit Vehicle
                </span>
                <span className="text-sm sm:text-base font-bold text-[#1C1B1B] capitalize flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#00C9A7]" />
                  {route.vehicleType}
                </span>
                <span className="text-[10px] text-[#747878]">Corridor fleet</span>
              </div>
            </div>
          </section>

          {/* 3 · Step-by-Step Waypoints Corridor Timeline ────────────────── */}
          <section
            aria-labelledby="waypoints-heading"
            className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <h2 id="waypoints-heading" className="text-sm font-bold uppercase tracking-wider text-[#747878] m-0">
                Boarding & Drop-Off Guidance
              </h2>
              <span className="text-[10px] font-semibold bg-[#F4F1EE] px-2 py-0.5 rounded text-[#5A5C5D]">
                Step-by-Step
              </span>
            </div>

            <div className="flex flex-col gap-0 relative pl-2 pt-1">
              {/* Waypoint 1: Boarding Point */}
              <div className="flex items-start gap-3 pb-5 relative">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-[#005047] text-[#79F7E3] flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                    1
                  </div>
                  <div className="w-0.5 flex-1 bg-[#005047]/30 my-1 min-h-6" />
                </div>
                <div className="flex flex-col pt-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#005047]">
                    Boarding Point
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#1C1B1B]">
                    {boardingName}
                  </span>
                  <span className="text-xs text-[#747878]">
                    Catch {route.vehicleType} here towards {destName}
                  </span>
                </div>
              </div>

              {/* Waypoint 2: Transfer Point (Optional) */}
              {transferName && (
                <div className="flex items-start gap-3 pb-5 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-[#FFC72C] text-[#1C1B1B] flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                      2
                    </div>
                    <div className="w-0.5 flex-1 bg-neutral-300 my-1 min-h-6" />
                  </div>
                  <div className="flex flex-col pt-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A6200]">
                      Transfer Junction
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#1C1B1B]">
                      {transferName}
                    </span>
                    <span className="text-xs text-[#747878]">
                      Corridor connection / interchange point
                    </span>
                  </div>
                </div>
              )}

              {/* Waypoint 3: Drop-Off Point */}
              <div className="flex items-start gap-3 relative">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-[#1C1B1B] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                    {transferName ? "3" : "2"}
                  </div>
                </div>
                <div className="flex flex-col pt-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#747878]">
                    Drop-Off / Final Stop
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#1C1B1B]">
                    {dropOffName}
                  </span>
                  <span className="text-xs text-[#747878]">
                    Destination bus stop & terminal area
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 4 · Nearby Essentials (Live Google Places + Live Corridor Vendors, Capped to 6) ──── */}
          <NearbyEssentialsSection
            places={liveNearbyPlaces}
            isLoading={isNearbyLoading}
            destName={destName}
            maxItems={6}
            onViewAll={(activeFilter) =>
              navigate(`/routes/${routeIdToTrack}/nearby-essentials`, {
                state: { activeFilter },
              })
            }
          />


          {/* 5 · Action Buttons ───────────────────────────────────────── */}
          <section className="flex flex-col sm:flex-row gap-3 pt-3">
            <PrimaryButton
              id="share-trip-btn"
              onClick={() => navigate("/share", {
                state: {
                  origin: originName,
                  destination: destName,
                  fare: formatFareRange(route.fareLow, route.fareHigh),
                  routeId: route._id,
                }
              })}
              width="full"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Trip</span>
            </PrimaryButton>

            <SecondaryButton
              id="view-all-network-btn"
              onClick={() => navigate("/routes")}
              width="full"
            >
              Back to Route Network
            </SecondaryButton>
          </section>
        </div>
      </main>

      {/* Floating Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
};

export default RouteDetails;
