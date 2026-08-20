/* ── Route types ─────────────────────────────────────────────────────────── */

// Matches backend route.model.js enum: ['bus', 'keke', 'taxi', 'train']
// Note: route.validation.js strictly accepts ['bus', 'keke', 'taxi'] for creation.
export type VehicleType = "bus" | "keke" | "taxi" | "train";
export type ConfidenceLevel = "Low" | "Medium" | "High" | "Unconfirmed";

export interface RoutePoint {
  placeId?: string;
  name: string;
  lat?: number;
  lng?: number;
}

export interface LocationPlace {
  placeId?: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Parameters sent to GET /api/routes/search.
 *
 * Backend (route.controller.js:475-494) now requires coordinates —
 * originLat/originLng/destinationLat/destinationLng.
 * PlaceId fields are kept for cache key construction only.
 */
export interface RouteSearchParams {
  // Required by backend for geospatial Haversine search
  originLat?: number;
  originLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  // Optional extras used for cache keys and display labels
  originPlaceId?: string;
  originName?: string;
  destinationPlaceId?: string;
  destinationName?: string;
  vehicleType?: string;
  radius?: number;
}

/**
 * Canonical shape that all UI components receive.
 * Both /api/routes (flat) and /api/routes/search (nested) are
 * normalised into this shape before reaching any component.
 */
export interface Route {
  _id: string;
  id?: string;
  origin: string | RoutePoint;
  destination: string | RoutePoint;
  boardingPoint?: string | RoutePoint;
  transferPoint?: string | RoutePoint;
  dropOffPoint?: string | RoutePoint;
  vehicleType: VehicleType;
  // Flat fare fields — guaranteed by normalizeRoute()
  fareLow: number;
  fareHigh: number;
  /** Computed average of all confirmed fares for this route */
  averageFare?: number;
  confidenceScore?: number;
  confidenceLevel: ConfidenceLevel;
  totalConfirmations?: number;
  lastConfirmedAt?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

/** Helper to extract place name from string or RoutePoint object */
export function getRoutePlaceName(place?: string | RoutePoint | null): string {
  if (!place) return "";
  if (typeof place === "string") return place;
  return place.name || "";
}

/** Safe currency formatting helper that prevents runtime crashes on missing, null, or undefined values */
export function formatFareRange(
  fareLow?: number | null,
  fareHigh?: number | null
): string {
  const low = typeof fareLow === "number" && !isNaN(fareLow) ? fareLow : null;
  const high = typeof fareHigh === "number" && !isNaN(fareHigh) ? fareHigh : null;

  if (low != null && high != null) {
    return `₦${low.toLocaleString()} – ₦${high.toLocaleString()}`;
  }
  if (low != null) {
    return `₦${low.toLocaleString()}`;
  }
  if (high != null) {
    return `₦${high.toLocaleString()}`;
  }
  return "Fare unconfirmed";
}

/**
 * Normalises a raw backend route document into the canonical `Route` shape.
 *
 * WHY THIS EXISTS:
 *  - GET /api/routes       → flat fields: fareLow, fareHigh, confidenceLevel
 *  - GET /api/routes/search → nested fields: fare.low, fare.high, confidence.level,
 *                             guidance.boarding, guidance.dropOff
 *
 * Without normalisation, reading `route.fareLow` on a search result returns
 * undefined and triggers a runtime crash (exactly like the previous bug with
 * route.fareLow.toLocaleString()). This adapter is the single source of truth.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeRoute(raw: any): Route {
  // Fare: search returns nested `fare.{low,high,average}`, getAllRoutes returns flat
  const fareLow: number =
    typeof raw.fareLow === "number" ? raw.fareLow :
    typeof raw.fare?.low === "number" ? raw.fare.low :
    0;

  const fareHigh: number =
    typeof raw.fareHigh === "number" ? raw.fareHigh :
    typeof raw.fare?.high === "number" ? raw.fare.high :
    0;

  const averageFare: number | undefined =
    typeof raw.averageFare === "number" ? raw.averageFare :
    typeof raw.fare?.average === "number" ? raw.fare.average :
    undefined;

  // Confidence: search returns nested `confidence.{score,level}`
  const confidenceScore: number | undefined =
    typeof raw.confidenceScore === "number" ? raw.confidenceScore :
    typeof raw.confidence?.score === "number" ? raw.confidence.score :
    undefined;

  const confidenceLevel: ConfidenceLevel =
    (raw.confidenceLevel as ConfidenceLevel) ??
    (raw.confidence?.level as ConfidenceLevel) ??
    "Unconfirmed";

  // Guidance: search returns nested `guidance.{boarding,transfer,dropOff}`
  // getAllRoutes returns boardingPoint / dropOffPoint as objects
  const boardingPoint: string | RoutePoint | undefined =
    raw.boardingPoint ??
    (raw.guidance?.boarding ? { name: raw.guidance.boarding } : undefined);

  const transferPoint: string | RoutePoint | undefined =
    raw.transferPoint ??
    (raw.guidance?.transfer ? { name: raw.guidance.transfer } : undefined);

  const dropOffPoint: string | RoutePoint | undefined =
    raw.dropOffPoint ??
    (raw.guidance?.dropOff ? { name: raw.guidance.dropOff } : undefined);

  return {
    _id: raw._id ?? raw.id ?? "",
    id: raw.id ?? raw._id ?? "",
    origin: raw.origin ?? "",
    destination: raw.destination ?? "",
    boardingPoint,
    transferPoint,
    dropOffPoint,
    vehicleType: raw.vehicleType ?? "bus",
    fareLow,
    fareHigh,
    averageFare,
    confidenceScore,
    confidenceLevel,
    totalConfirmations: raw.totalConfirmations ?? 0,
    lastConfirmedAt: raw.lastConfirmedAt,
    createdBy: raw.createdBy,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    __v: raw.__v,
  };
}


/* ── Create route ────────────────────────────────────────────────────────── */

/**
 * Payload for POST /api/routes/create.
 *
 * IMPORTANT: Backend (route.controller.js:36-47) now rejects requests
 * where origin.lat or destination.lat is undefined — lat and lng are REQUIRED.
 */
export interface CreateRoutePayload {
  origin: {
    placeId: string;
    name: string;
    lat: number;
    lng: number;
  };
  destination: {
    placeId: string;
    name: string;
    lat: number;
    lng: number;
  };
  boardingPoint?: {
    name: string;
    placeId?: string;
  };
  transferPoint?: {
    name?: string;
    placeId?: string;
  };
  dropOffPoint?: {
    name: string;
    placeId?: string;
  };
  vehicleType: VehicleType;
  fareLow: number;
  fareHigh: number;
  averageFare?: number;
}

export interface CreateRouteResponse {
  message: string;
  route: Route;
}

/* ── Get all routes ──────────────────────────────────────────────────────── */

export interface GetAllRoutesResponse {
  success: boolean;
  count: number;
  routes: Route[];
}

/* ── Search routes ───────────────────────────────────────────────────────── */

/**
 * Backend (route.controller.js:946-979) returns:
 *   { success, count, canCreateRoute, searchRadiusKm, routes }
 * canCreateRoute is true when count === 0.
 */
export interface SearchRoutesResponse {
  success: boolean;
  count: number;
  canCreateRoute?: boolean;
  searchRadiusKm?: number;
  routes?: Route[];
  message?: string;
}

/* ── Get route by id ─────────────────────────────────────────────────────── */

export interface GetRouteByIdResponse {
  success?: boolean;
  message: string;
  route: Route;
}

