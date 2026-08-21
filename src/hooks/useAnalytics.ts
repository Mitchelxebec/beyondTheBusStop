import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  getBusinessAnalytics,
  getListingPerformance,
} from "../services/analytics";
import type {
  BusinessAnalyticsData,
  ListingPerformanceItem,
} from "../types/analytics";

/**
 * Hook to fetch vendor business analytics (total views, rating, daily trend, commuter reach).
 */
export function useBusinessAnalytics(
  period: 7 | 30 = 7
): UseQueryResult<BusinessAnalyticsData, Error> {
  return useQuery<BusinessAnalyticsData, Error>({
    queryKey: ["vendor-analytics", "business", period],
    queryFn: async () => {
      const res = await getBusinessAnalytics(period);
      return res.analytics;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch performance stats for all listings belonging to the vendor.
 */
export function useListingPerformance(
  period: 7 | 30 = 7
): UseQueryResult<ListingPerformanceItem[], Error> {
  return useQuery<ListingPerformanceItem[], Error>({
    queryKey: ["vendor-analytics", "listings", period],
    queryFn: async () => {
      const res = await getListingPerformance(period);
      return res.listings;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}
