/* any future page needing route data should use this hook rather than a fresh useQuery call */
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAllRoutes, getRouteById } from "../services/routes";
import { getRoutePlaceName, type Route } from "../types/routes";

export const ROUTE_QUERY_KEYS = {
  all: ["routes", "all"] as const,
  search: (query: string) => ["routes", "search", query.trim()] as const,
  detail: (id: string) => ["routes", "detail", id] as const,
};

/**
 * Shared hook for fetching transit routes.
 * 
 * - When `searchQuery` is omitted or empty: fetches all routes via `getAllRoutes()` using key `["routes", "all"]`.
 * - When `searchQuery` is provided: fetches all routes via `getAllRoutes()` and filters client-side across the full corridor (destination, origin, boardingPoint, dropOffPoint, transferPoint) using key `["routes", "search", query]`.
 * 
 * Guarantees: Always returns a consistently-unwrapped `Route[]` array across all callers.
 */
export function useRoutes(searchQuery?: string): UseQueryResult<Route[], Error> {
  const trimmed = searchQuery?.trim() ?? "";
  const isSearch = trimmed.length > 0;

  return useQuery<Route[], Error>({
    queryKey: isSearch ? ROUTE_QUERY_KEYS.search(trimmed) : ROUTE_QUERY_KEYS.all,
    queryFn: async () => {
      const res = await getAllRoutes();
      const all = res.routes ?? [];
      if (isSearch) {
        const lower = trimmed.toLowerCase();
        return all.filter((r) => {
          const dest = getRoutePlaceName(r.destination).toLowerCase();
          const orig = getRoutePlaceName(r.origin).toLowerCase();
          const board = getRoutePlaceName(r.boardingPoint).toLowerCase();
          const drop = getRoutePlaceName(r.dropOffPoint).toLowerCase();
          const transfer = getRoutePlaceName(r.transferPoint).toLowerCase();

          return (
            dest.includes(lower) ||
            orig.includes(lower) ||
            board.includes(lower) ||
            drop.includes(lower) ||
            transfer.includes(lower)
          );
        });
      }
      return all;
    },
  });
}

/**
 * Hook for fetching single transit route details by ID.
 */
export function useRouteById(id?: string): UseQueryResult<Route | null, Error> {
  return useQuery<Route | null, Error>({
    queryKey: ROUTE_QUERY_KEYS.detail(id ?? ""),
    queryFn: async () => {
      if (!id) return null;
      const res = await getRouteById(id);
      return res.route ?? null;
    },
    enabled: Boolean(id),
  });
}

export default useRoutes;
