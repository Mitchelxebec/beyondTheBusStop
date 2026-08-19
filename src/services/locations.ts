import { api } from "../lib/axios";

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
}

export interface NearbySearchResponse {
  success: boolean;
  type: string;
  count: number;
  places: NearbyPlace[];
}

export interface LocationSearchResult {
  placeId: string;
  name: string;
  address: string;
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
  type: "hospital" | "police" | "market"
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
 * Static placeholder dataset for Listed Vendors in transit corridors.
 * // TODO: replace with real API response when vendor proximity endpoint exists
 * // (no geolocation on the Business model in BTBS-BACKEND as of August 2026).
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
 * Runs two concurrent Places proximity queries (origin and destination),
 * merges and deduplicates by place ID, and returns a sorted list by distance.
 */
export async function getMergedNearbyEssentials(
  originCoords: { lat: number; lng: number },
  destCoords: { lat: number; lng: number }
): Promise<NearbyPlace[]> {
  const types: Array<"hospital" | "police" | "market"> = [
    "hospital",
    "police",
    "market",
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

    const results = await Promise.all([...originPromises, ...destPromises]);
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
