// ─── Backend Analytics Contract Types ──────────────────────────────────────────

export interface DailyListingView {
  date: string; // "YYYY-MM-DD"
  day: string;  // "Mon", "Tue", etc.
  views: number;
}

export interface CommuterReachItem {
  location: string;
  views: number;
}

export interface BusinessAnalyticsData {
  period: number; // 7 or 30
  totalViews: number;
  viewsChange: number; // percentage change vs previous period
  averageRating: number;
  totalReviews: number;
  listingViews: DailyListingView[];
  commuterReach: CommuterReachItem[];
}

export interface BusinessAnalyticsResponse {
  success: boolean;
  analytics: BusinessAnalyticsData;
}

export interface ListingPerformanceItem {
  listingId: string;
  description: string;
  photoUrls: string[];
  views: number;
  createdAt: string;
}

export interface ListingPerformanceResponse {
  success: boolean;
  period: number;
  listings: ListingPerformanceItem[];
}
