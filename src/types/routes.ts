/* ── Route types ─────────────────────────────────────────────────────────── */

// Matches backend route.model.js enum exactly: ['bus', 'keke', 'taxi', 'train']
export type VehicleType = "bus" | "keke" | "taxi" | "train";
export type ConfidenceLevel = "Low" | "Medium" | "High" | "Unconfirmed";

export interface RoutePoint {
  placeId?: string;
  name: string;
}

export interface Route {
  _id: string;
  id?: string;
  origin: string | RoutePoint;
  destination: string | RoutePoint;
  boardingPoint?: string | RoutePoint;
  transferPoint?: string | RoutePoint;
  dropOffPoint?: string | RoutePoint;
  vehicleType: VehicleType;
  fareLow: number;
  fareHigh: number;
  /** Computed average of all confirmed fares for this route */
  averageFare?: number;
  confidenceScore?: number;
  confidenceLevel: ConfidenceLevel;
  totalConfirmations?: number;
  lastConfirmedAt?: string;
  createdBy: string;
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

/* ── Create route ────────────────────────────────────────────────────────── */

export interface CreateRoutePayload {
  origin: string;
  destination: string;
  boardingPoint?: string;
  transferPoint?: string;
  dropOffPoint?: string;
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

// Backend returns { success, count, routes } or { success, count, message } when empty
export interface SearchRoutesResponse {
  success: boolean;
  count: number;
  routes?: Route[];
  message?: string;
}

/* ── Get route by id ─────────────────────────────────────────────────────── */

export interface GetRouteByIdResponse {
  success?: boolean;
  message: string;
  route: Route;
}
