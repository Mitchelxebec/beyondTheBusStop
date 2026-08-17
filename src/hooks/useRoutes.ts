/* any future page needing route data should use this hook rather than a fresh useQuery call */
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAllRoutes, searchRoutes } from "../services/routes";
import type { Route } from "../types/routes";

export const ROUTE_QUERY_KEYS = {
  all: ["routes", "all"] as const,
  search: (query: string) => ["routes", "search", query.trim()] as const,
};

/**
 * Shared hook for fetching transit routes.
 * 
 * - When `searchQuery` is omitted or empty: fetches all routes via `getAllRoutes()` using key `["routes", "all"]`.
 * - When `searchQuery` is provided: fetches matching routes via `searchRoutes(query)` using key `["routes", "search", query]`.
 * 
 * Guarantees: Always returns a consistently-unwrapped `Route[]` array across all callers.
 */
export function useRoutes(searchQuery?: string): UseQueryResult<Route[], Error> {
  const trimmed = searchQuery?.trim() ?? "";
  const isSearch = trimmed.length > 0;

  return useQuery<Route[], Error>({
    queryKey: isSearch ? ROUTE_QUERY_KEYS.search(trimmed) : ROUTE_QUERY_KEYS.all,
    queryFn: async () => {
      if (isSearch) {
        const res = await searchRoutes(trimmed);
        return res.routes ?? [];
      }
      const res = await getAllRoutes();
      return res.routes ?? [];
    },
  });
}

export default useRoutes;
