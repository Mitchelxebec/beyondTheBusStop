import { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Loader2, ArrowRight, Navigation } from "lucide-react";
import { searchPlaces, getPlaceDetails, resolveCoordinates } from "../services/locations";
import type { LocationPlace } from "../types/routes";
import type { LocationSearchResult } from "../services/locations";

export interface RouteSearchBoxProps {
  initialOrigin?: LocationPlace | null;
  initialDestination?: LocationPlace | null;
  onSearch: (origin: LocationPlace, destination: LocationPlace) => void;
  variant?: "card" | "compact";
  className?: string;
}

/**
 * RouteSearchBox
 *
 * Reusable two-input search component with:
 * - Live Google Places location autocomplete via `/api/places/autocomplete`.
 * - Automatic coordinate resolution via `getPlaceDetails` (`/api/places/details/:id`).
 * - "Use Current Location" (GPS) support via HTML5 Geolocation API.
 * - Validation of verified coordinates before executing geospatial route search.
 */
export const RouteSearchBox = ({
  initialOrigin = null,
  initialDestination = null,
  onSearch,
  variant = "card",
  className = "",
}: RouteSearchBoxProps) => {
  // ── Origin state ─────────────────────────────────────────────────────────────
  const [originInput, setOriginInput] = useState(initialOrigin?.name ?? "");
  const [selectedOrigin, setSelectedOrigin] = useState<LocationPlace | null>(
    initialOrigin
  );
  const [originSuggestions, setOriginSuggestions] = useState<LocationSearchResult[]>([]);
  const [isOriginLoading, setIsOriginLoading] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);

  // ── Destination state ────────────────────────────────────────────────────────
  const [destInput, setDestInput] = useState(initialDestination?.name ?? "");
  const [selectedDest, setSelectedDest] = useState<LocationPlace | null>(
    initialDestination
  );
  const [destSuggestions, setDestSuggestions] = useState<LocationSearchResult[]>([]);
  const [isDestLoading, setIsDestLoading] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // ── Error state ──────────────────────────────────────────────────────────────
  const [validationError, setValidationError] = useState<string | null>(null);

  const originBoxRef = useRef<HTMLDivElement>(null);
  const destBoxRef = useRef<HTMLDivElement>(null);

  // Sync with initial props when provided
  useEffect(() => {
    if (initialOrigin) {
      setOriginInput(initialOrigin.name);
      setSelectedOrigin(initialOrigin);
    }
  }, [initialOrigin]);

  useEffect(() => {
    if (initialDestination) {
      setDestInput(initialDestination.name);
      setSelectedDest(initialDestination);
    }
  }, [initialDestination]);

  // Click outside listener to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        originBoxRef.current &&
        !originBoxRef.current.contains(event.target as Node)
      ) {
        setShowOriginDropdown(false);
      }
      if (
        destBoxRef.current &&
        !destBoxRef.current.contains(event.target as Node)
      ) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Origin Autocomplete
  useEffect(() => {
    if (!originInput.trim() || selectedOrigin?.name === originInput) {
      setOriginSuggestions([]);
      setIsOriginLoading(false);
      return;
    }

    if (originInput.trim().length < 2) {
      setOriginSuggestions([]);
      return;
    }

    setIsOriginLoading(true);
    const timer = setTimeout(async () => {
      const results = await searchPlaces(originInput);
      setOriginSuggestions(results);
      setIsOriginLoading(false);
      setShowOriginDropdown(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [originInput, selectedOrigin]);

  // Debounced Destination Autocomplete
  useEffect(() => {
    if (!destInput.trim() || selectedDest?.name === destInput) {
      setDestSuggestions([]);
      setIsDestLoading(false);
      return;
    }

    if (destInput.trim().length < 2) {
      setDestSuggestions([]);
      return;
    }

    setIsDestLoading(true);
    const timer = setTimeout(async () => {
      const results = await searchPlaces(destInput);
      setDestSuggestions(results);
      setIsDestLoading(false);
      setShowDestDropdown(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [destInput, selectedDest]);

  // GPS Current Location Handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setValidationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsGpsLoading(true);
    setValidationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        const loc: LocationPlace = {
          name: "Current Location",
          latitude,
          longitude,
        };
        setSelectedOrigin(loc);
        setOriginInput("Current Location");
        setShowOriginDropdown(false);
        setIsGpsLoading(false);
      },
      (err) => {
        setIsGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setValidationError("Location access was denied. Please select a starting location from the list.");
        } else {
          setValidationError("Could not determine your current location. Please search for a location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Select Place handler with coordinate resolution
  const handleSelectOrigin = async (place: LocationSearchResult) => {
    setShowOriginDropdown(false);
    setValidationError(null);
    setOriginInput(place.name);

    let lat = place.location.latitude ?? undefined;
    let lng = place.location.longitude ?? undefined;

    if ((lat === undefined || lng === undefined) && place.placeId) {
      const details = await getPlaceDetails(place.placeId);
      if (details) {
        lat = details.lat;
        lng = details.lng;
      } else {
        const coords = await resolveCoordinates(place.name);
        lat = coords.lat;
        lng = coords.lng;
      }
    }

    const loc: LocationPlace = {
      placeId: place.placeId,
      name: place.name,
      address: place.address,
      latitude: lat,
      longitude: lng,
    };
    setSelectedOrigin(loc);
  };

  const handleSelectDest = async (place: LocationSearchResult) => {
    setShowDestDropdown(false);
    setValidationError(null);
    setDestInput(place.name);

    let lat = place.location.latitude ?? undefined;
    let lng = place.location.longitude ?? undefined;

    if ((lat === undefined || lng === undefined) && place.placeId) {
      const details = await getPlaceDetails(place.placeId);
      if (details) {
        lat = details.lat;
        lng = details.lng;
      } else {
        const coords = await resolveCoordinates(place.name);
        lat = coords.lat;
        lng = coords.lng;
      }
    }

    const loc: LocationPlace = {
      placeId: place.placeId,
      name: place.name,
      address: place.address,
      latitude: lat,
      longitude: lng,
    };
    setSelectedDest(loc);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    let originToSubmit = selectedOrigin;
    let destToSubmit = selectedDest;

    // If user typed origin without clicking dropdown, try resolving
    if (!originToSubmit || originToSubmit.name !== originInput) {
      if (!originInput.trim()) {
        setValidationError("Please enter or select a starting location.");
        return;
      }
      const coords = await resolveCoordinates(originInput.trim());
      originToSubmit = {
        name: originInput.trim(),
        latitude: coords.lat,
        longitude: coords.lng,
      };
      setSelectedOrigin(originToSubmit);
    }

    // If user typed destination without clicking dropdown, try resolving
    if (!destToSubmit || destToSubmit.name !== destInput) {
      if (!destInput.trim()) {
        setValidationError("Please enter or select a destination.");
        return;
      }
      const coords = await resolveCoordinates(destInput.trim());
      destToSubmit = {
        name: destInput.trim(),
        latitude: coords.lat,
        longitude: coords.lng,
      };
      setSelectedDest(destToSubmit);
    }

    // Ensure both have valid coordinates
    if (originToSubmit.latitude === undefined || originToSubmit.longitude === undefined) {
      const coords = await resolveCoordinates(originToSubmit.name);
      originToSubmit = { ...originToSubmit, latitude: coords.lat, longitude: coords.lng };
    }

    if (destToSubmit.latitude === undefined || destToSubmit.longitude === undefined) {
      const coords = await resolveCoordinates(destToSubmit.name);
      destToSubmit = { ...destToSubmit, latitude: coords.lat, longitude: coords.lng };
    }

    onSearch(originToSubmit, destToSubmit);
  };

  const isCompact = variant === "compact";

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex flex-col gap-3 ${
        isCompact
          ? "bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-xs"
          : "bg-white p-4 sm:p-5 rounded-3xl border border-black/5 shadow-sm"
      } ${className}`}
    >
      {/* Validation Error Banner */}
      {validationError && (
        <div
          role="alert"
          className="p-2.5 rounded-xl bg-red-50 border border-red-200/60 text-red-600 text-xs font-medium animate-in fade-in duration-150"
        >
          {validationError}
        </div>
      )}

      {/* ── Input 1: Origin (From) ────────────────────────────────────────── */}
      <div ref={originBoxRef} className="relative flex flex-col">
        <div className="flex items-center justify-between mb-1 px-1">
          <label
            htmlFor="search-origin-input"
            className="text-[11px] font-bold text-[#747878] uppercase tracking-wider"
          >
            From (Origin)
          </label>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isGpsLoading}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#007A62] hover:text-[#005047] transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Use current GPS location"
          >
            {isGpsLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Navigation className="w-3 h-3" />
            )}
            <span>Use Current Location</span>
          </button>
        </div>

        <div className="relative flex items-center">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747878] pointer-events-none">
            {isOriginLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#00C9A7]" />
            ) : (
              <MapPin className="w-4 h-4 text-[#005047]" />
            )}
          </span>
          <input
            id="search-origin-input"
            type="text"
            value={originInput}
            onChange={(e) => {
              setOriginInput(e.target.value);
              setSelectedOrigin(null);
              setValidationError(null);
            }}
            onFocus={() => {
              if (originSuggestions.length > 0) setShowOriginDropdown(true);
            }}
            placeholder="Search starting location (e.g. Maryland, Oshodi)..."
            autoComplete="off"
            className="w-full h-11 pl-10 pr-9 rounded-xl bg-[#F5F5F0] border border-transparent focus:border-[#00C9A7]/40 focus:bg-white text-sm text-[#1C1B1B] placeholder:text-[#747878] outline-none transition-all"
          />
          {originInput && (
            <button
              type="button"
              onClick={() => {
                setOriginInput("");
                setSelectedOrigin(null);
                setOriginSuggestions([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
              aria-label="Clear origin input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Origin Autocomplete Suggestions Dropdown */}
        {showOriginDropdown && originSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-2xl shadow-xl border border-black/10 overflow-hidden max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 divide-y divide-neutral-100">
            {originSuggestions.map((place) => (
              <button
                key={place.placeId}
                type="button"
                onClick={() => handleSelectOrigin(place)}
                className="w-full px-4 py-3 text-left hover:bg-[#F5F5F0] flex items-start gap-2.5 transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#005047] shrink-0 mt-0.5" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#1C1B1B] truncate">
                    {place.name}
                  </span>
                  <span className="text-[11px] text-[#747878] truncate">
                    {place.address}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Input 2: Destination (To) ─────────────────────────────────────── */}
      <div ref={destBoxRef} className="relative flex flex-col">
        <label
          htmlFor="search-destination-input"
          className="text-[11px] font-bold text-[#747878] uppercase tracking-wider mb-1 px-1"
        >
          To (Destination)
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747878] pointer-events-none">
            {isDestLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#00C9A7]" />
            ) : (
              <Search className="w-4 h-4 text-[#6F5400]" />
            )}
          </span>
          <input
            id="search-destination-input"
            type="text"
            value={destInput}
            onChange={(e) => {
              setDestInput(e.target.value);
              setSelectedDest(null);
              setValidationError(null);
            }}
            onFocus={() => {
              if (destSuggestions.length > 0) setShowDestDropdown(true);
            }}
            placeholder="Search destination (e.g. Ikeja, CMS, Lekki)..."
            autoComplete="off"
            className="w-full h-11 pl-10 pr-9 rounded-xl bg-[#F5F5F0] border border-transparent focus:border-[#FFC72C] focus:bg-white text-sm text-[#1C1B1B] placeholder:text-[#747878] outline-none transition-all"
          />
          {destInput && (
            <button
              type="button"
              onClick={() => {
                setDestInput("");
                setSelectedDest(null);
                setDestSuggestions([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
              aria-label="Clear destination input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Destination Autocomplete Suggestions Dropdown */}
        {showDestDropdown && destSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-2xl shadow-xl border border-black/10 overflow-hidden max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 divide-y divide-neutral-100">
            {destSuggestions.map((place) => (
              <button
                key={place.placeId}
                type="button"
                onClick={() => handleSelectDest(place)}
                className="w-full px-4 py-3 text-left hover:bg-[#F5F5F0] flex items-start gap-2.5 transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#6F5400] shrink-0 mt-0.5" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#1C1B1B] truncate">
                    {place.name}
                  </span>
                  <span className="text-[11px] text-[#747878] truncate">
                    {place.address}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Submit Action ─────────────────────────────────────────────────── */}
      <button
        type="submit"
        id="search-routes-submit-btn"
        className="w-full h-11 mt-1 rounded-xl bg-[#1C1B1B] hover:bg-black text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.99] transition-all shadow-sm"
      >
        <span>Search Routes</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
};

export default RouteSearchBox;

