import { api } from "../lib/axios";
import type {
  BusinessAnalyticsResponse,
  ListingPerformanceResponse,
} from "../types/analytics";

/**
 * GET /api/analytics/business?period=7|30
 * Fetches aggregate vendor storefront analytics including total views,
 * daily trends, ratings, and top commuter reach locations.
 * Auth: protect middleware.
 */
export async function getBusinessAnalytics(
  period: 7 | 30 = 7
): Promise<BusinessAnalyticsResponse> {
  const { data } = await api.get<BusinessAnalyticsResponse>(
    "/analytics/business",
    {
      params: { period },
    }
  );
  return data;
}

/**
 * GET /api/analytics/listings?period=7|30
 * Fetches view statistics per listing for the authenticated vendor,
 * sorted by most viewed first.
 * Auth: protect middleware.
 */
export async function getListingPerformance(
  period: 7 | 30 = 7
): Promise<ListingPerformanceResponse> {
  const { data } = await api.get<ListingPerformanceResponse>(
    "/analytics/listings",
    {
      params: { period },
    }
  );
  return data;
}
