/* ── Route types ─────────────────────────────────────────────────────────── */

export type VehicleType = "bus" | "keke" | "danfo" | "taxi";
export type ConfidenceLevel = "Low" | "Medium" | "High";

export interface Route {
  _id: string;
  origin: string;
  destination: string;
  vehicleType: VehicleType;
  fareLow: number;
  fareHigh: number;
  confidenceLevel: ConfidenceLevel;
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

export interface SearchRoutesResponse {
  message: string;
  routes: Route[];
}

/* ── Get route by id ─────────────────────────────────────────────────────── */

export interface GetRouteByIdResponse {
  message: string;
  route: Route;
}
