// ─── Listing Reviews & Ratings Types ──────────────────────────────────────────
// Source: BTBS-BACKEND/src/controllers/review.controller.js:8-150
//         BTBS-BACKEND/src/models/review.model.js:4-37

export interface ReviewUser {
  _id: string;
  fullName: string;
}

export interface ReviewItem {
  _id: string;
  listingId: string;
  businessId?: string;
  userId: ReviewUser | string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
}

export interface GetReviewsResponse {
  success: boolean;
  summary: ReviewSummary;
  reviews: ReviewItem[];
}

export interface CreateReviewPayload {
  rating: number;
  comment: string;
}

export interface CreateReviewResponse {
  success: boolean;
  message: string;
  review: ReviewItem;
}
