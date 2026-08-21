import { api } from "../lib/axios";
import type {
  GetReviewsResponse,
  CreateReviewPayload,
  CreateReviewResponse,
} from "../types/reviews";

/**
 * GET /api/reviews/:listingId — public
 * Fetches all customer reviews and aggregated summary for a listing.
 * Mounted: app.js:214 → /api/reviews
 * Controller: BTBS-BACKEND/src/controllers/review.controller.js:98-150
 */
export async function getListingReviews(
  listingId: string
): Promise<GetReviewsResponse> {
  const { data } = await api.get<GetReviewsResponse>(`/reviews/${listingId}`);
  return data;
}

/**
 * POST /api/reviews/:listingId — requires Bearer token
 * Submits a rating (1-5) and comment on a listing.
 * Duplicate check: returns 409 Conflict if user already reviewed.
 * Mounted: app.js:214 → /api/reviews
 * Controller: BTBS-BACKEND/src/controllers/review.controller.js:8-92
 */
export async function createReview(
  listingId: string,
  payload: CreateReviewPayload
): Promise<CreateReviewResponse> {
  const { data } = await api.post<CreateReviewResponse>(
    `/reviews/${listingId}`,
    payload
  );
  return data;
}
