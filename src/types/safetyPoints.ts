/* ── Safety Point types ───────────────────────────────────────────────────── */

// Matches backend safetyPoint.model.js enum exactly:
// ['police station', 'hospital', 'fire station', 'other']
export type SafetyPointCategory =
  | "police station"
  | "hospital"
  | "fire station"
  | "other";

export interface SafetyPointLocation {
  Latitude?: number;
  Longitude?: number;
}

export interface SafetyPoint {
  _id: string;
  name: string;
  category?: SafetyPointCategory;
  location?: SafetyPointLocation;
  address?: string;
  verificationNote?: string;
  __v?: number;
}

/* ── Get all safety points ───────────────────────────────────────────────── */

// GET /api/safety-points/
// Backend returns: { success: true, count: N, safetyPoints: [...] }
export interface GetSafetyPointsResponse {
  success: boolean;
  count: number;
  safetyPoints: SafetyPoint[];
}

/* ── Get by category ─────────────────────────────────────────────────────── */

// GET /api/safety-points/category/:category
// Backend returns: { success: true, count: N, points: [...] }  — note key is "points" not "safetyPoints"
// On empty (404): { message: "No safety points found for the specified category" }
export interface GetByCategoryResponse {
  success?: boolean;
  count?: number;
  points?: SafetyPoint[];
  message?: string;
}

/* ── Create safety point (admin only) ────────────────────────────────────── */

// POST /api/safety-points/
// Backend returns: { message: "Safety Point created successfully", safetyPoint: {...} }
export interface CreateSafetyPointPayload {
  name: string;
  category?: SafetyPointCategory;
  location?: SafetyPointLocation;
  address?: string;
}

export interface CreateSafetyPointResponse {
  message: string;
  safetyPoint: SafetyPoint;
}
