import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, MapPin, Bus, Car, Train } from "lucide-react";

interface RouteMapProps {
  originName: string;
  destinationName: string;
  originCoords: { lat: number; lng: number };
  destinationCoords: { lat: number; lng: number };
  vehicleType?: string;
  boardingPointName?: string;
  dropOffPointName?: string;
  className?: string;
}

/**
 * RouteMap
 *
 * Live Leaflet map (OpenStreetMap tiles — no API key required)
 * plotting boarding point, drop-off point, and the connecting transit corridor.
 */
export const RouteMap = ({
  originName,
  destinationName,
  originCoords,
  destinationCoords,
  vehicleType = "bus",
  boardingPointName,
  dropOffPointName,
  className = "",
}: RouteMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const oLat = originCoords.lat || 6.5538;
    const oLng = originCoords.lng || 3.3552;
    const dLat = destinationCoords.lat || 6.6018;
    const dLng = destinationCoords.lng || 3.3515;

    // 1. Initialize Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    });
    mapInstanceRef.current = map;

    // 2. Add OpenStreetMap Tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      subdomains: ["a", "b", "c"],
    }).addTo(map);

    // 3. Custom HTML Marker Icons
    const originIcon = L.divIcon({
      className: "custom-leaflet-origin-marker",
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background-color: #005047; color: #79F7E3; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border-radius: 9999px; padding: 4px 8px; font-size: 10px; font-weight: 700; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #79F7E3;"></span>
            ${boardingPointName || originName}
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #005047; margin-top: -1px;"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    const destIcon = L.divIcon({
      className: "custom-leaflet-dest-marker",
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background-color: #FFC72C; color: #1C1B1B; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border-radius: 9999px; padding: 4px 8px; font-size: 10px; font-weight: 800; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #6F5400;"></span>
            ${dropOffPointName || destinationName}
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #FFC72C; margin-top: -1px;"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    // 4. Place Markers
    const originMarker = L.marker([oLat, oLng], { icon: originIcon }).addTo(map);
    const destMarker = L.marker([dLat, dLng], { icon: destIcon }).addTo(map);

    originMarker.bindPopup(`<b>Boarding Point:</b> ${boardingPointName || originName}`);
    destMarker.bindPopup(`<b>Drop-off Point:</b> ${dropOffPointName || destinationName}`);

    // 5. Connecting Transit Route Polyline
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

    // 6. Fit Bounds with Padding
    const bounds = L.latLngBounds([
      [oLat, oLng],
      [dLat, dLng],
    ]);
    map.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 15,
    });

    // 7. Add small Zoom Control on Top-Right
    L.control
      .zoom({
        position: "topright",
      })
      .addTo(map);

    // Invalidate size after layout completes
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [
    originCoords.lat,
    originCoords.lng,
    destinationCoords.lat,
    destinationCoords.lng,
    originName,
    destinationName,
    boardingPointName,
    dropOffPointName,
  ]);

  const ModeIcon =
    vehicleType.toLowerCase() === "train"
      ? Train
      : vehicleType.toLowerCase() === "taxi" || vehicleType.toLowerCase() === "keke"
      ? Car
      : Bus;

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden shadow-sm border border-black/8 bg-[#EDE8E3] ${className}`}
    >
      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-64 sm:h-72 z-0"
        style={{ minHeight: "16rem" }}
      />

      {/* Top Left Corridor Overlay Tag */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-black/10 shadow-xs">
        <div className="w-6 h-6 rounded-lg bg-[#005047] text-[#79F7E3] flex items-center justify-center">
          <ModeIcon className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#747878] leading-tight">
            Live Transit Corridor
          </span>
          <span className="text-xs font-bold text-[#1C1B1B] leading-tight capitalize">
            {vehicleType} Corridor
          </span>
        </div>
      </div>

      {/* Bottom Bar: Quick summary pill */}
      <div className="absolute bottom-3 left-3 right-3 z-10 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-black/10 shadow-xs flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[#1C1B1B] font-semibold truncate">
          <MapPin className="w-3.5 h-3.5 text-[#005047] shrink-0" />
          <span className="truncate">{boardingPointName || originName}</span>
          <Navigation className="w-3 h-3 text-[#747878] rotate-90 shrink-0" />
          <span className="truncate">{dropOffPointName || destinationName}</span>
        </div>
        <span className="text-[10px] font-medium text-[#747878] shrink-0 pl-2">
          OpenStreetMap
        </span>
      </div>
    </div>
  );
};

export default RouteMap;
