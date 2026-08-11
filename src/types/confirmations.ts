/* ── Confirmation types ───────────────────────────────────────────────────── */

// Matches backend confirmation.model.js enum exactly:
// ['Pending', 'Verified', 'Rejected']
export type VerificationStatus = "Pending" | "Verified" | "Rejected";

// When getRouteConfirmations runs, userId is populated with { fullName, email }
export interface ConfirmationUser {
  _id: string;
  fullName?: string;
  email: string;
}

export interface Confirmation {
  _id: string;
  routeId: string;
  /** Populated as { _id, fullName, email } by getRouteConfirmations */
  userId: ConfirmationUser | string;
  confirmedFare: number;
  verificationStatus: VerificationStatus;
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
// Body: { confirmedFare: number }  (must be > 0)
// Returns: { message, confirmation }
export interface CreateConfirmationPayload {
  confirmedFare: number;
}

export interface CreateConfirmationResponse {
  message: string;
  confirmation: Confirmation;
}

/* ── Update a confirmation ────────────────────────────────────────────────── */

// PATCH /api/confirmations/:confirmationId — protected (owner or admin)
// Body: { confirmedFare: number }
// NOTE: backend only saves confirmedFare — verificationStatus is NOT updatable via this endpoint
// Returns: { message, confirmation }
export interface UpdateConfirmationPayload {
  confirmedFare: number;
}

export interface UpdateConfirmationResponse {
  message: string;
  confirmation: Confirmation;
}

/* ── Delete a confirmation ────────────────────────────────────────────────── */

// DELETE /api/confirmations/:confirmationId — protected (admin only)
// Returns: { message, confirmation }
export interface DeleteConfirmationResponse {
  message: string;
  confirmation: Confirmation;
}
