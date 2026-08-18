import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

interface LocationPickerMapProps {
  /** Called whenever the user moves the pin — provides the new lat/lng. */
  onLocationChange: (coords: { lat: number; lng: number }) => void;
  /** Initial center coordinates. Defaults to Lagos Island. */
  initialCoords?: { lat: number; lng: number };
  className?: string;
}

// Default centre: Lagos Island, Nigeria
const DEFAULT_LAT = 6.455;
const DEFAULT_LNG = 3.3841;

/**
 * LocationPickerMap
 *
 * Lightweight single-pin Leaflet map for location selection.
 * - User can drag the marker to adjust the pin position.
 * - User can tap/click anywhere on the map to re-place the pin.
 * - Fires `onLocationChange` on every pin placement or drag end.
 * - Uses OpenStreetMap tiles — no API key required.
 *
 * Intentionally separate from RouteMap.tsx to avoid
 * corridor-rendering concerns.
 */
const LocationPickerMap = ({
  onLocationChange,
  initialCoords,
  className = "",
}: LocationPickerMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance on re-mount
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const startLat = initialCoords?.lat ?? DEFAULT_LAT;
    const startLng = initialCoords?.lng ?? DEFAULT_LNG;

    // 1. Initialise Map
    const map = L.map(mapContainerRef.current, {
      center: [startLat, startLng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });
    mapInstanceRef.current = map;

    // 2. OpenStreetMap Tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      subdomains: ["a", "b", "c"],
    }).addTo(map);

    // 3. Zoom Control (top-right, matching RouteMap pattern)
    L.control.zoom({ position: "topright" }).addTo(map);

    // 4. Custom draggable pin icon
    const pinIcon = L.divIcon({
      className: "btbs-location-pin",
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
          <div style="
            width:36px;height:36px;
            background:#F5B800;
            border:3px solid #fff;
            border-radius:9999px 9999px 9999px 0;
            transform:rotate(-45deg);
            box-shadow:0 4px 12px rgba(0,0,0,0.25);
            display:flex;align-items:center;justify-content:center;
          ">
            <span style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </span>
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    // 5. Place the draggable marker
    const marker = L.marker([startLat, startLng], {
      icon: pinIcon,
      draggable: true,
    }).addTo(map);
    markerRef.current = marker;

    // 6. Emit initial coords on mount
    onLocationChange({ lat: startLat, lng: startLng });

    // 7. Emit coords on drag end
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      onLocationChange({ lat: pos.lat, lng: pos.lng });
    });

    // 8. Click anywhere on the map to move the pin
    map.on("click", (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      onLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    // 9. Invalidate size after layout renders
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden shadow-sm border border-black/8 bg-[#EDE8E3] ${className}`}
    >
      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full z-0"
        style={{ height: "220px" }}
      />

      {/* "Adjust Pin" overlay — bottom centre, matching Figma */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/10 shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-[#F5B800] shrink-0" aria-hidden="true" />
          <span className="text-[11px] font-semibold text-[#1C1B1B] whitespace-nowrap">
            Drag pin or tap map to adjust
          </span>
        </div>
      </div>

      {/* OSM attribution — bottom right */}
      <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
        <span className="text-[9px] text-[#747878] bg-white/80 px-1.5 py-0.5 rounded">
          © OpenStreetMap
        </span>
      </div>
    </div>
  );
};

export default LocationPickerMap;
