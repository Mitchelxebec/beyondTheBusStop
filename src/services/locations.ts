import { api } from "../lib/axios";
import { getPublicListings } from "./listings";

export interface NearbyPlace {
  placeId: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  distance: number;
  distanceUnit: string;
  rating?: number | null;
  userRatingsTotal?: number;
  openNow?: boolean | null;
  types: string[];
  category?: "hospital" | "police" | "market" | "vendor";
  imageUrl?: string | null;
  profilePicture?: string | null;
}

export interface NearbySearchResponse {
  success: boolean;
  type: string;
  count: number;
  places: NearbyPlace[];
}

/**
 * Autocomplete result returned by GET /api/places/autocomplete?input=
 * (googlePlaces.controller.js:91-130 → googleMaps.service.js:194-227)
 *
 * NOTE: The autocomplete endpoint returns ONLY { placeId, name, description }.
 * It does NOT return coordinates. To get lat/lng, call getPlaceDetails(placeId).
 */
export interface LocationSearchResult {
  placeId: string;
  name: string;
  address: string; // maps to `description` in autocomplete response
  /** Coordinates — only present after calling getPlaceDetails() */
  location: {
    latitude: number | null;
    longitude: number | null;
  };
  types: string[];
}

export interface LocationSearchResponse {
  success: boolean;
  count: number;
  places?: LocationSearchResult[];
  results?: LocationSearchResult[];
}

/**
 * Place details response from GET /api/places/details/:placeId
 * (googlePlaces.controller.js:135-172 → googleMaps.service.js:264-335)
 * Returns { placeId, name, address, lat, lng }
 */
export interface PlaceDetailsResult {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

/**
 * Fetches full place details including lat/lng for a given Google Place ID.
 * Endpoint: GET /api/places/details/:placeId  (app.js:189 → googlePlaces.routes.js:27-30)
 *
 * Used whenever we need coordinates to submit to GET /api/routes/search,
 * which requires originLat/originLng/destinationLat/destinationLng.
 */
export async function getPlaceDetails(
  placeId: string
): Promise<PlaceDetailsResult | null> {
  if (!placeId) return null;
  try {
    const { data } = await api.get<{ success: boolean; place: PlaceDetailsResult }>(
      `/places/details/${encodeURIComponent(placeId)}`
    );
    if (data.success && data.place) return data.place;
    return null;
  } catch (error) {
    console.warn("[getPlaceDetails] Failed:", error);
    return null;
  }
}

/**
 * COSMETIC PATCH ONLY:
 * Strips leading Google Open Location Codes (Plus Codes), e.g. "483H+FWX, Ojere, ...".
 *
 * NOTE: The actual fix belongs in the backend's Google Geocoding API call
 * (which is currently missing the `language=en` query parameter and result type
 * prioritization to favor `street_address` / `route` / `premise` over `plus_code`).
 *
 * @param address - Raw formatted address or location name from geocoding.
 * @returns Sanitized address without leading Plus Code, or null if empty / Plus-Code-only.
 */
export function stripPlusCode(address?: string | null): string | null {
  if (!address || typeof address !== "string") return null;

  const trimmed = address.trim();
  if (!trimmed) return null;

  // Leading Plus Code: 4-8 alphanumeric chars, '+', 2-4 alphanumeric chars, optional comma & space
  const PLUS_CODE_PREFIX_REGEX = /^[A-Z0-9]{4,8}\+[A-Z0-9]{2,4}(?:,\s*|\s+)?/i;

  if (PLUS_CODE_PREFIX_REGEX.test(trimmed)) {
    const cleaned = trimmed.replace(PLUS_CODE_PREFIX_REGEX, "").trim();
    return cleaned.length > 0 ? cleaned : null;
  }

  return trimmed;
}

/**
 * Result returned by GET /api/places/reverse-geocode?lat=...&lng=...
 * (googlePlaces.controller.js:174-215 → googleMaps.service.js:485-567)
 */
export interface ReverseGeocodeResult {
  placeId: string | null;
  formattedAddress: string | null;
  name: string;
  latitude: number;
  longitude: number;
  addressComponents?: any[];
  types?: string[];
}

/**
 * Converts GPS latitude & longitude coordinates to a human-readable street name and place ID.
 * Endpoint: GET /api/places/reverse-geocode?lat=:lat&lng=:lng
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  try {
    const { data } = await api.get<{
      success: boolean;
      location?: ReverseGeocodeResult;
      place?: ReverseGeocodeResult;
    }>("/places/reverse-geocode", {
      params: { lat, lng },
      timeout: 5000,
    });
    if (data.success && (data.location || data.place)) {
      const raw = data.location || data.place;
      if (!raw) return null;

      const cleanedName = stripPlusCode(raw.name);
      const cleanedFormattedAddress = stripPlusCode(raw.formattedAddress);

      // If the address was purely a Plus Code, cleanedName & cleanedFormattedAddress will be null.
      // In that case, return null so downstream callers fall back to raw coordinates or "Current Location".
      const finalName = cleanedName || cleanedFormattedAddress;
      if (!finalName) {
        return null;
      }

      return {
        ...raw,
        name: finalName,
        formattedAddress: cleanedFormattedAddress || finalName,
      };
    }
    return null;
  } catch (error) {
    console.warn("[reverseGeocode] Lookup failed:", error);
    return null;
  }
}

/**
 * Searches real-world locations via the backend Google Places autocomplete proxy.
 * Endpoint: GET /api/places/autocomplete?input=:query
 * (app.js:189 → googlePlaces.routes.js:17-20 → googlePlaces.controller.js:91-130)
 *
 * Lagos-biased via rectangular bounding box in googleMaps.service.js:171-182.
 *
 * IMPORTANT: The autocomplete response does NOT include coordinates.
 * Coordinates must be resolved separately via getPlaceDetails(placeId) before
 * submitting a route search.
 */
export async function searchPlaces(query: string): Promise<LocationSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const { data } = await api.get<{
      success: boolean;
      count: number;
      places?: Array<{ placeId: string; name: string; description?: string }>;
    }>("/places/autocomplete", {
      params: { input: trimmed },
    });

    return (data.places ?? []).map((p) => ({
      placeId: p.placeId,
      name: p.name,
      address: p.description ?? "",
      location: { latitude: null, longitude: null },
      types: [],
    }));
  } catch (error) {
    console.warn("[searchPlaces] Failed to fetch locations from backend proxy:", error);
    return [];
  }
}


/**
 * Pre-calibrated geographic coordinates for major Lagos transit hubs & corridors.
 * Used for instant map plotting and as an immediate fallback if external geocoding is slow/offline.
 */
export const LAGOS_COORDINATES: Record<string, { lat: number; lng: number }> = {
  oshodi: { lat: 6.5538, lng: 3.3552 },
  "oshodi interchange": { lat: 6.5552, lng: 3.3584 },
  ikeja: { lat: 6.6018, lng: 3.3515 },
  "computer village": { lat: 6.5985, lng: 3.3421 },
  cms: { lat: 6.4531, lng: 3.3958 },
  "lagos island": { lat: 6.4549, lng: 3.4246 },
  "victoria island": { lat: 6.4281, lng: 3.4219 },
  "vi": { lat: 6.4281, lng: 3.4219 },
  yaba: { lat: 6.5095, lng: 3.3711 },
  ojuelegba: { lat: 6.5147, lng: 3.3614 },
  lekki: { lat: 6.4698, lng: 3.5852 },
  "lekki phase 1": { lat: 6.4474, lng: 3.4731 },
  egbeda: { lat: 6.5954, lng: 3.2842 },
  ikoyi: { lat: 6.4549, lng: 3.4346 },
  berger: { lat: 6.6436, lng: 3.3639 },
  ojota: { lat: 6.5822, lng: 3.3855 },
  surulere: { lat: 6.4969, lng: 3.3582 },
  mile2: { lat: 6.4636, lng: 3.3155 },
  "mile 2": { lat: 6.4636, lng: 3.3155 },
  ikorodu: { lat: 6.6194, lng: 3.5105 },
  ajah: { lat: 6.4674, lng: 3.5658 },
  maryland: { lat: 6.5746, lng: 3.3664 },
  festac: { lat: 6.4715, lng: 3.2831 },
  obalende: { lat: 6.4501, lng: 3.4182 },
  mushin: { lat: 6.5303, lng: 3.3541 },
  agege: { lat: 6.6180, lng: 3.3209 },
  costain: { lat: 6.4812, lng: 3.3710 },
  marina: { lat: 6.4519, lng: 3.3905 },
};

/**
 * Resolve coordinates for a location string (e.g. "Ikeja", "Oshodi Interchange").
 */
export async function resolveCoordinates(
  name: string
): Promise<{ lat: number; lng: number }> {
  if (!name) return { lat: 6.5244, lng: 3.3792 };

  const cleanName = name.toLowerCase().trim();

  // 1. Direct dictionary match
  for (const [key, coords] of Object.entries(LAGOS_COORDINATES)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return coords;
    }
  }

  // 2. Try live backend place search (reads places array from backend response)
  try {
    const { data } = await api.get<LocationSearchResponse>("/locations/search", {
      params: { q: name },
    });
    const items = data.places ?? data.results;
    if (items && items.length > 0) {
      const loc = items[0].location;
      if (loc.latitude && loc.longitude) {
        return { lat: loc.latitude, lng: loc.longitude };
      }
    }
  } catch {
    // Graceful fallback on network/backend failure
  }

  // Default to central Lagos
  return { lat: 6.5244, lng: 3.3792 };
}

/**
 * GET /api/locations/nearby — Live Google Places proximity endpoint.
 * Normalizes backend latitude/longitude into lat/lng.
 */
export async function getNearbyPlaces(
  lat: number,
  lng: number,
  type: "hospital" | "police"
): Promise<NearbySearchResponse> {
  try {
    const { data } = await api.get<{
      success?: boolean;
      type?: string;
      count?: number;
      places?: Array<{
        placeId: string;
        name: string;
        address: string;
        location?: {
          latitude?: number;
          longitude?: number;
          lat?: number;
          lng?: number;
        };
        distance?: number;
        distanceUnit?: string;
        rating?: number | null;
        userRatingsTotal?: number;
        openNow?: boolean | null;
        types?: string[];
        category?: "hospital" | "police" | "market" | "vendor";
      }>;
    }>("/locations/nearby", {
      params: { lat, lng, type },
    });

    const rawPlaces = data.places || [];
    const normalizedPlaces: NearbyPlace[] = rawPlaces.map((p) => {
      const latitude = p.location?.latitude ?? p.location?.lat ?? 0;
      const longitude = p.location?.longitude ?? p.location?.lng ?? 0;
      return {
        placeId: p.placeId,
        name: p.name,
        address: p.address,
        location: {
          lat: latitude,
          lng: longitude,
        },
        distance: p.distance ?? 0,
        distanceUnit: p.distanceUnit ?? "km",
        rating: p.rating ?? null,
        userRatingsTotal: p.userRatingsTotal ?? 0,
        openNow: p.openNow ?? null,
        types: p.types ?? [],
        category: p.category ?? type,
      };
    });

    return {
      success: data.success ?? true,
      type: data.type ?? type,
      count: normalizedPlaces.length,
      places: normalizedPlaces,
    };
  } catch {
    // If nearby endpoint errors or key is unavailable, return empty list gracefully
    return { success: false, type, count: 0, places: [] };
  }
}

/**
 * Calculates the great-circle distance between two geographic coordinates using the Haversine formula.
 * Returns distance in kilometers (km).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const earthRadius = 6371; // Earth radius in km
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

/**
 * Fetches live public listings across all vendors from GET /api/listings
 * and computes client-side proximity to the route corridor's origin and destination.
 */
export async function getLiveCorridorVendors(
  originCoords: { lat: number; lng: number },
  destCoords: { lat: number; lng: number }
): Promise<NearbyPlace[]> {
  try {
    const res = await getPublicListings();
    const listings = res.listings || [];

    const vendorPlaces: NearbyPlace[] = [];

    for (const item of listings) {
      if (
        !item.location ||
        typeof item.location.lat !== "number" ||
        typeof item.location.lng !== "number"
      ) {
        continue;
      }

      const distToOrigin = calculateHaversineDistanceKm(
        originCoords.lat,
        originCoords.lng,
        item.location.lat,
        item.location.lng
      );

      const distToDest = calculateHaversineDistanceKm(
        destCoords.lat,
        destCoords.lng,
        item.location.lat,
        item.location.lng
      );

      const minDistance = Math.min(distToOrigin, distToDest);
      const vendorImage =
        item.photoUrls?.[0] ||
        item.profilePicture ||
        item.vendorAvatar ||
        null;

      vendorPlaces.push({
        placeId: item._id,
        name: item.businessName,
        address: item.description,
        location: {
          lat: item.location.lat,
          lng: item.location.lng,
        },
        distance: Number(minDistance.toFixed(2)),
        distanceUnit: "km",
        rating: null,
        userRatingsTotal: 0,
        openNow: true,
        types: ["vendor", item.category || "retail"],
        category: "vendor",
        imageUrl: vendorImage,
        profilePicture: item.profilePicture || null,
      });
    }

    return vendorPlaces;
  } catch (error) {
    console.warn("[getLiveCorridorVendors] Failed to fetch live vendor listings:", error);
    return [];
  }
}

/**
 * @deprecated Use live vendor listings fetched dynamically via getMergedNearbyEssentials
 */
export const STATIC_CORRIDOR_VENDORS: NearbyPlace[] = [
  {
    placeId: "vendor-static-1",
    name: "Iya Basira Quick Buka & Cold Drinks",
    address: "Beside Main Terminal Gate 2",
    location: { lat: 6.5538, lng: 3.3552 },
    distance: 0.15,
    distanceUnit: "km",
    rating: 4.8,
    userRatingsTotal: 64,
    openNow: true,
    types: ["vendor", "food", "restaurant"],
    category: "vendor",
  },
  {
    placeId: "vendor-static-2",
    name: "Chukwudi Point-of-Sale (POS) & Airtime",
    address: "Opposite BRT Boarding Platform A",
    location: { lat: 6.5545, lng: 3.356 },
    distance: 0.22,
    distanceUnit: "km",
    rating: 4.6,
    userRatingsTotal: 38,
    openNow: true,
    types: ["vendor", "finance", "pos"],
    category: "vendor",
  },
  {
    placeId: "vendor-static-3",
    name: "Alhaji Danfo Refreshments & Gala Depot",
    address: "Under Bridge Commercial Corridor",
    location: { lat: 6.556, lng: 3.358 },
    distance: 0.35,
    distanceUnit: "km",
    rating: 4.5,
    userRatingsTotal: 112,
    openNow: true,
    types: ["vendor", "convenience"],
    category: "vendor",
  },
];

/**
 * Runs Places proximity queries (origin and destination) and fetches live corridor vendors,
 * merges and deduplicates by place ID, and returns a sorted list by distance.
 */
export async function getMergedNearbyEssentials(
  originCoords: { lat: number; lng: number },
  destCoords: { lat: number; lng: number }
): Promise<NearbyPlace[]> {
  const types: Array<"hospital" | "police"> = [
    "hospital",
    "police",
  ];

  try {
    const originPromises = types.map((t) =>
      getNearbyPlaces(originCoords.lat, originCoords.lng, t).then((res) =>
        (res.places || []).map((p) => ({ ...p, category: t }))
      )
    );

    const destPromises = types.map((t) =>
      getNearbyPlaces(destCoords.lat, destCoords.lng, t).then((res) =>
        (res.places || []).map((p) => ({ ...p, category: t }))
      )
    );

    const vendorsPromise = getLiveCorridorVendors(originCoords, destCoords);

    const results = await Promise.all([
      ...originPromises,
      ...destPromises,
      vendorsPromise,
    ]);
    const flattened = results.flat();

    // Deduplicate by placeId
    const seen = new Set<string>();
    const deduplicated: NearbyPlace[] = [];

    for (const place of flattened) {
      if (!place || !place.placeId) continue;
      if (!seen.has(place.placeId)) {
        seen.add(place.placeId);
        deduplicated.push(place);
      }
    }

    // Sort closest -> farthest
    deduplicated.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return deduplicated;
  } catch (error) {
    console.warn("[NearbyEssentials] Error fetching places:", error);
    return [];
  }
}
