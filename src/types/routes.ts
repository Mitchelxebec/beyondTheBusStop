/* ── Route types ─────────────────────────────────────────────────────────── */

// Matches backend route.model.js enum exactly: ['bus', 'keke', 'taxi', 'train']
export type VehicleType = "bus" | "keke" | "taxi" | "train";
export type ConfidenceLevel = "Low" | "Medium" | "High";

export interface Route {
  _id: string;
  origin: string;
  destination: string;
  vehicleType: VehicleType;
  fareLow: number;
  fareHigh: number;
  /** Computed average of all confirmed fares for this route */
  averageFare?: number;
  confidenceScore?: number;
  confidenceLevel: ConfidenceLevel;
  lastConfirmedAt?: string;
  createdBy: string;
  __v?: number;
}

/* ── Create route ────────────────────────────────────────────────────────── */

export interface CreateRoutePayload {
  origin: string;
  destination: string;
  vehicleType: VehicleType;
  fareLow: number;
  fareHigh: number;
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
  message: string;
  route: Route;
}
