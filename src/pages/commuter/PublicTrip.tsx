import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { usePublicTrip, useTripDirections } from "../../hooks/useTrips";
import { getSocket, type LocationUpdatedEvent } from "../../lib/socket";
import type { PublicTrip as PublicTripType, TripDirections } from "../../types/trips";
import { formatFareRange } from "../../types/routes";

// ─── Polyline Decoding Utility ─────────────────────────────────────────────────

/**
 * Decodes a Google Encoded Polyline string into an array of [latitude, longitude] pairs.
 */
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

const BusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 6h8M3 6h18M3 10h18M5 18H3v-8h18v8h-2M9 18h6" />
    <circle cx="7.5" cy="18.5" r="1.5" />
    <circle cx="16.5" cy="18.5" r="1.5" />
  </svg>
);

const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const FareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11 4.5-.85 8-5.75 8-11V6l-8-4z" />
  </svg>
);

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  planned:   { bg: "bg-[#FFF8E6]",  text: "text-[#8A6200]", dot: "bg-[#FFC72C]",       label: "Trip Planned" },
  active:    { bg: "bg-[#E6FAF6]",  text: "text-[#005047]", dot: "bg-[#00C9A7] animate-pulse", label: "Live — Tracking Active" },
  completed: { bg: "bg-[#F4F1EE]",  text: "text-[#444748]", dot: "bg-neutral-400",      label: "Trip Completed" },
  cancelled: { bg: "bg-[#FCE8E6]",  text: "text-[#BA1A1A]", dot: "bg-[#BA1A1A]",        label: "Trip Cancelled" },
};

// ─── Detail row ───────────────────────────────────────────────────────────────

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <span className="w-8 h-8 rounded-lg bg-[#F4F1EE] flex items-center justify-center shrink-0 text-[#444748]">
      {icon}
    </span>
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#747878]">{label}</span>
      <span className="text-sm font-semibold text-[#1C1B1B]">{value}</span>
    </div>
  </div>
);

// ─── Public Trip Map Component ─────────────────────────────────────────────────

interface PublicTripMapProps {
  trip: PublicTripType;
  directions?: TripDirections | null;
  liveLocation: { latitude: number; longitude: number; updatedAt: string } | null;
}

const PublicTripMap = ({ trip, directions, liveLocation }: PublicTripMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const liveMarkerRef = useRef<L.Marker | null>(null);

  const effectiveLocation = liveLocation || trip.currentLocation;

  // 1. Initialize and render base map + polyline + origin/destination markers
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default coordinates if directions resolution fails
    const oLat = directions?.originLocation?.latitude || 6.5538;
    const oLng = directions?.originLocation?.longitude || 3.3552;
    const dLat = directions?.destinationLocation?.latitude || 6.6018;
    const dLng = directions?.destinationLocation?.longitude || 3.3515;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    });
    mapInstanceRef.current = map;

    // Tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      subdomains: ["a", "b", "c"],
    }).addTo(map);

    // Custom Origin Marker Icon
    const originIcon = L.divIcon({
      className: "custom-leaflet-origin-marker",
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background-color: #005047; color: #79F7E3; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border-radius: 9999px; padding: 4px 8px; font-size: 10px; font-weight: 700; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #79F7E3;"></span>
            ${trip.boardingPoint.name || trip.origin.name}
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #005047; margin-top: -1px;"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    // Custom Destination Marker Icon
    const destIcon = L.divIcon({
      className: "custom-leaflet-dest-marker",
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background-color: #FFC72C; color: #1C1B1B; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border-radius: 9999px; padding: 4px 8px; font-size: 10px; font-weight: 800; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #6F5400;"></span>
            ${trip.dropOffPoint.name || trip.destination.name}
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #FFC72C; margin-top: -1px;"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    const originMarker = L.marker([oLat, oLng], { icon: originIcon }).addTo(map);
    const destMarker = L.marker([dLat, dLng], { icon: destIcon }).addTo(map);

    originMarker.bindPopup(`<b>Boarding Point:</b> ${trip.boardingPoint.name || trip.origin.name}`);
    destMarker.bindPopup(`<b>Drop-off Point:</b> ${trip.dropOffPoint.name || trip.destination.name}`);

    // Draw Polyline: Decoded polyline if available, or Option A straight dashed fallback line
    let polylineCoords: [number, number][] = [];
    if (directions?.encodedPolyline) {
      try {
        polylineCoords = decodePolyline(directions.encodedPolyline);
      } catch (err) {
        console.warn("[PublicTripMap] Failed to decode polyline:", err);
      }
    }

    if (polylineCoords.length > 0) {
      L.polyline(polylineCoords, {
        color: "#005047",
        weight: 5,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      map.fitBounds(L.latLngBounds(polylineCoords), {
        padding: [36, 36],
        maxZoom: 16,
      });
    } else {
      // Option A: Straight dashed line fallback (no error banner)
      L.polyline(
        [
          [oLat, oLng],
          [dLat, dLng],
        ],
        {
          color: "#005047",
          weight: 4,
          dashArray: "6, 8",
          opacity: 0.85,
          lineCap: "round",
          lineJoin: "round",
        }
      ).addTo(map);

      map.fitBounds(
        L.latLngBounds([
          [oLat, oLng],
          [dLat, dLng],
        ]),
        {
          padding: [36, 36],
          maxZoom: 15,
        }
      );
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [trip, directions]);

  // 2. Real-time Live Location Pin Updates via Socket.IO
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (effectiveLocation && typeof effectiveLocation.latitude === "number" && typeof effectiveLocation.longitude === "number") {
      const lat = effectiveLocation.latitude;
      const lng = effectiveLocation.longitude;

      const liveIcon = L.divIcon({
        className: "custom-leaflet-live-commuter-marker",
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
            <span style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background-color: #00C9A7; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            <div style="position: relative; width: 22px; height: 22px; border-radius: 9999px; background-color: #005047; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; margin: auto;">
              <span style="width: 8px; height: 8px; border-radius: 9999px; background-color: #79F7E3;"></span>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      if (!liveMarkerRef.current) {
        liveMarkerRef.current = L.marker([lat, lng], { icon: liveIcon, zIndexOffset: 1000 }).addTo(map);
        liveMarkerRef.current.bindPopup("<b>Commuter Live Location</b>");
      } else {
        liveMarkerRef.current.setLatLng([lat, lng]);
      }
    }
  }, [effectiveLocation]);

  return (
    <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden shadow-inner border border-black/5 relative z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

// ─── Trip card ────────────────────────────────────────────────────────────────

interface TripCardProps {
  trip: PublicTripType;
  directions?: TripDirections | null;
  liveLocation: { latitude: number; longitude: number; updatedAt: string } | null;
  sharingStopped: boolean;
}

const TripCard = ({ trip, directions, liveLocation, sharingStopped }: TripCardProps) => {
  const status = STATUS_STYLES[trip.status] ?? STATUS_STYLES.planned;
  const effectiveLocation = liveLocation || trip.currentLocation;

  return (
    <div className="flex flex-col gap-5">

      {/* Hero route card */}
      <div className="bg-[#00C9A7] rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#005047]">
              Shared Trip
            </span>
            <div className="flex items-center gap-2 text-white font-bold text-xl flex-wrap">
              <span>{trip.origin.name}</span>
              <span className="text-white/50">→</span>
              <span>{trip.destination.name}</span>
            </div>
          </div>

          {/* Status badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${status.bg} ${status.text}`}>
            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
            {status.label}
          </div>
        </div>
      </div>

      {/* Interactive Live Map & Route Polyline */}
      <PublicTripMap
        trip={trip}
        directions={directions}
        liveLocation={liveLocation}
      />

      {/* Details card */}
      <div className="bg-white rounded-2xl p-5 border border-black/5 flex flex-col gap-4">
        <h2 className="text-sm font-bold text-[#1C1B1B] m-0">Journey Details</h2>

        <div className="flex flex-col gap-4">
          <DetailRow
            icon={<BusIcon />}
            label="Transport"
            value={trip.vehicleType.charAt(0).toUpperCase() + trip.vehicleType.slice(1)}
          />
          <DetailRow
            icon={<PinIcon />}
            label="Boarding Point"
            value={trip.boardingPoint.name}
          />
          <DetailRow
            icon={<PinIcon />}
            label="Drop-off Point"
            value={trip.dropOffPoint.name}
          />
          <DetailRow
            icon={<FareIcon />}
            label="Expected Fare"
            value={formatFareRange(trip.fareLow, trip.fareHigh)}
          />
          {trip.confidenceScore !== undefined && (
            <DetailRow
              icon={<ShieldIcon />}
              label="Route Confidence"
              value={`${trip.confidenceScore}% — ${trip.confidenceLevel}`}
            />
          )}
        </div>
      </div>

      {/* Active live location card */}
      {trip.status === "active" && effectiveLocation && (
        <div className="bg-[#005047] rounded-2xl p-5 flex flex-col gap-2 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00C9A7] animate-pulse" />
              <span className="text-xs font-bold text-[#79F7E3] uppercase tracking-wider">
                Live Location {liveLocation ? "(Streaming)" : ""}
              </span>
            </div>
            {sharingStopped && (
              <span className="text-[11px] text-amber-300 font-medium">
                Sharing paused
              </span>
            )}
          </div>
          <p className="text-sm text-white/90 m-0">
            Last updated:{" "}
            <span className="font-semibold text-white">
              {new Date(effectiveLocation.updatedAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </p>
          <p className="text-xs text-white/60 font-mono m-0">
            {effectiveLocation.latitude.toFixed(5)},{" "}
            {effectiveLocation.longitude.toFixed(5)}
          </p>
        </div>
      )}

      {/* Completed notice */}
      {trip.status === "completed" && (
        <div className="bg-[#F4F1EE] rounded-2xl p-4 text-center">
          <p className="text-sm text-[#444748] m-0">
            This trip has been completed. The commuter has arrived safely. 🎉
          </p>
        </div>
      )}

      {/* Footer branding */}
      <div className="text-center pt-2">
        <p className="text-xs text-[#747878]">
          Shared via <span className="font-bold text-[#005047]">Beyond The Bus Stop</span>
        </p>
      </div>
    </div>
  );
};

// ─── Page ──────────────────────────────────────────────────────────────────────

const PublicTrip = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { data: trip, isLoading, isError, error } = usePublicTrip(shareToken);
  const { data: directions } = useTripDirections(shareToken);
  const [liveLocation, setLiveLocation] = useState<{
    latitude: number;
    longitude: number;
    updatedAt: string;
  } | null>(null);
  const [sharingStopped, setSharingStopped] = useState(false);

  // ── Socket.IO Live Tracker Connection ──────────────────────────────────────
  useEffect(() => {
    if (!shareToken) return;

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    // 1. Join room
    socket.emit("joinTrip", shareToken);

    // 2. Receive location updates
    const handleLocationUpdated = (data: LocationUpdatedEvent) => {
      setLiveLocation({
        latitude: data.latitude,
        longitude: data.longitude,
        updatedAt: data.updatedAt,
      });
      setSharingStopped(false);
    };

    // 3. Handle stop location sharing
    const handleSharingStopped = () => {
      setSharingStopped(true);
    };

    socket.on("locationUpdated", handleLocationUpdated);
    socket.on("locationSharingStopped", handleSharingStopped);

    return () => {
      socket.off("locationUpdated", handleLocationUpdated);
      socket.off("locationSharingStopped", handleSharingStopped);
    };
  }, [shareToken]);

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F0]">

      {/* Minimal header — no nav (public page, no auth) */}
      <header className="w-full bg-[#005047] px-4 py-4 flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#79F7E3]">
            Beyond The Bus Stop
          </span>
          <span className="text-sm font-bold text-white">Live Trip Tracker</span>
        </div>
      </header>

      <main
        className="flex-1 w-full mx-auto px-4 sm:px-6 py-6"
        style={{ maxWidth: "min(100%, 48rem)" }}
        aria-label="Public trip view"
      >
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-[#005047]/20 border-t-[#005047] rounded-full animate-spin" />
            <p className="text-sm font-semibold text-[#1C1B1B]">Loading trip details…</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#FCE8E6] flex items-center justify-center text-[#BA1A1A] text-2xl font-bold">
              !
            </div>
            <h2 className="text-base font-bold text-[#1C1B1B] m-0">Trip Not Found</h2>
            <p className="text-xs text-[#747878] max-w-xs m-0">
              {error?.message || "This trip link is invalid or has expired."}
            </p>
          </div>
        )}

        {trip && (
          <TripCard
            trip={trip}
            directions={directions}
            liveLocation={liveLocation}
            sharingStopped={sharingStopped}
          />
        )}
      </main>
    </div>
  );
};

export default PublicTrip;
