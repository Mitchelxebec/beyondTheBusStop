/* any future page needing route data should use this hook rather than a fresh useQuery call */
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAllRoutes, getRouteById, searchRoutes } from "../services/routes";
import { getRoutePlaceName, type Route, type RouteSearchParams } from "../types/routes";

export const ROUTE_QUERY_KEYS = {
  all: ["routes", "all"] as const,
  /**
   * Cache key uses coordinates (not placeIds) because the backend
   * searchRoutes endpoint (route.controller.js:457) now operates on coordinates.
   */
  searchParams: (params: RouteSearchParams) =>
    [
      "routes",
      "search",
      params.originLat ?? "",
      params.originLng ?? "",
      params.destinationLat ?? "",
      params.destinationLng ?? "",
      params.vehicleType || "all",
    ] as const,
  searchQuery: (query: string) => ["routes", "search", query.trim()] as const,
  detail: (id: string) => ["routes", "detail", id] as const,
};

/**
 * Shared hook for fetching transit routes.
 * 
 * - When `searchArg` is a `RouteSearchParams` object with originLat, originLng,
 *   destinationLat, and destinationLng: calls live backend
 *   `GET /api/routes/search` with coordinate-based geospatial matching.
 * - When `searchArg` is omitted or empty: fetches all routes via `getAllRoutes()`.
 * - When `searchArg` is a plain string query: fetches all routes and filters by name.
 */
export function useRoutes(
  searchArg?: RouteSearchParams | string
): UseQueryResult<Route[], Error> {
  // Trigger coordinate-based search only when all four coordinates are present
  const isStructured =
    typeof searchArg === "object" &&
    searchArg?.originLat !== undefined &&
    searchArg?.originLng !== undefined &&
    searchArg?.destinationLat !== undefined &&
    searchArg?.destinationLng !== undefined;

  const stringQuery = typeof searchArg === "string" ? searchArg.trim() : "";
  const isStringSearch = stringQuery.length > 0;

  const queryKey = isStructured
    ? ROUTE_QUERY_KEYS.searchParams(searchArg as RouteSearchParams)
    : isStringSearch
    ? ROUTE_QUERY_KEYS.searchQuery(stringQuery)
    : ROUTE_QUERY_KEYS.all;

  return useQuery<Route[], Error>({
    queryKey,
    queryFn: async () => {
      if (isStructured) {
        const res = await searchRoutes(searchArg as RouteSearchParams);
        return res.routes ?? [];
      }

      const res = await getAllRoutes();
      const all = res.routes ?? [];

      if (isStringSearch) {
        const lower = stringQuery.toLowerCase();
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
