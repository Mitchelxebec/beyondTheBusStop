import type { ConfidenceLevel } from "./routes";

/* ── Confirmation types ───────────────────────────────────────────────────── */

// Matches backend confirmation.model.js enum: ['Pending', 'Verified', 'Rejected']
export type VerificationStatus = "Pending" | "Verified" | "Rejected";

// When getRouteConfirmations runs, userId is populated with { fullName, email }
export interface ConfirmationUser {
  _id: string;
  fullName?: string;
  email?: string;
}

export interface Confirmation {
  _id?: string;
  id?: string;
  routeId: string;
  /** Populated as { _id, fullName, email } by getRouteConfirmations */
  userId: ConfirmationUser | string;
  confirmedFare: number;
  fareFairness?: number;
  everOvercharged?: boolean;
  easeFindingTransport?: number;
  confirmedAt?: string;
  isVerified?: boolean;
  verificationStatus?: VerificationStatus;
  notes?: string;
  __v?: number;
}

/* ── Get confirmations for a route ───────────────────────────────────────── */

// GET /api/confirmations/routes/:routeId — public
// Returns { success: true, count: N, confirmations: [...] } on results
// Returns { success: true, count: 0, message: "..." }        when empty
export interface GetRouteConfirmationsResponse {
  success: boolean;
  count: number;
  confirmations?: Confirmation[];
  message?: string;
}

/* ── Create a confirmation ────────────────────────────────────────────────── */

// POST /api/confirmations/:routeId — protected (any logged-in user)
export interface CreateConfirmationPayload {
  routeId: string;
  confirmedFare: number;
  fareFairness: number; // 1 to 5
  everOvercharged: boolean;
  easeFindingTransport: number; // 1 to 5
  notes?: string;
}

export interface BackendRouteConfirmationSummary {
  id: string;
  fare: {
    low: number;
    high: number;
    average: number;
  };
  confidence: {
    score: number;
    level: ConfidenceLevel;
    components?: {
      reportStrength?: number;
      fareAgreement?: number;
      dataFreshness?: number;
      fareFairness?: number;
      overchargeEvidence?: number;
      easeFindingTransport?: number;
    };
    independentReports?: number | null;
    totalReports?: number | null;
    medianFare?: number;
  };
  totalConfirmations: number;
  lastConfirmedAt?: string;
}

export interface CreateConfirmationResponse {
  success: boolean;
  message: string;
  confirmation: Confirmation;
  route: BackendRouteConfirmationSummary;
}

/* ── Update a confirmation ────────────────────────────────────────────────── */

// PATCH /api/confirmations/:confirmationId — protected (owner or admin)
export interface UpdateConfirmationPayload {
  confirmedFare?: number;
  fareFairness?: number;
  everOvercharged?: boolean;
  easeFindingTransport?: number;
  notes?: string;
}

export interface UpdateConfirmationResponse {
  success: boolean;
  message: string;
  confirmation: Confirmation;
  route?: BackendRouteConfirmationSummary;
}

/* ── Delete a confirmation ────────────────────────────────────────────────── */

// DELETE /api/confirmations/:confirmationId — protected (admin only)
export interface DeleteConfirmationResponse {
  success?: boolean;
  message: string;
  confirmation?: Confirmation;
}

