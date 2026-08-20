import { api } from "../lib/axios";
import type {
  CreateRoutePayload,
  CreateRouteResponse,
  GetAllRoutesResponse,
  SearchRoutesResponse,
  GetRouteByIdResponse,
  RouteSearchParams,
} from "../types/routes";
import { normalizeRoute } from "../types/routes";

/** POST /routes/create — requires Bearer token */
export async function createRoute(
  payload: CreateRoutePayload
): Promise<CreateRouteResponse> {
  const { data } = await api.post<CreateRouteResponse>("/routes/create", payload);
  return {
    ...data,
    route: data.route ? normalizeRoute(data.route) : data.route,
  };
}

/** GET /routes — returns all routes, normalised */
export async function getAllRoutes(): Promise<GetAllRoutesResponse> {
  const { data } = await api.get<GetAllRoutesResponse>("/routes");
  return {
    ...data,
    routes: (data.routes ?? []).map(normalizeRoute),
  };
}

/**
 * GET /routes/search — geospatial coordinate-based search.
 *
 * Backend (route.controller.js:457-997) now requires:
 *   originLat, originLng, destinationLat, destinationLng
 * It rejects requests where these are missing (HTTP 400).
 *
 * The search response uses nested shape { fare, confidence, guidance }
 * which normalizeRoute() flattens into the canonical Route shape.
 */
export async function searchRoutes(
  params: RouteSearchParams
): Promise<SearchRoutesResponse> {
  const queryParams: Record<string, string | number> = {};

  if (params.originLat !== undefined) queryParams.originLat = params.originLat;
  if (params.originLng !== undefined) queryParams.originLng = params.originLng;
  if (params.destinationLat !== undefined) queryParams.destinationLat = params.destinationLat;
  if (params.destinationLng !== undefined) queryParams.destinationLng = params.destinationLng;
  if (params.radius !== undefined) queryParams.radius = params.radius;
  if (params.vehicleType && params.vehicleType.toLowerCase() !== "all") {
    queryParams.vehicleType = params.vehicleType.toLowerCase();
  }

  const { data } = await api.get<SearchRoutesResponse>("/routes/search", {
    params: queryParams,
  });

  return {
    ...data,
    routes: (data.routes ?? []).map(normalizeRoute),
  };
}

/** GET /routes/:id */
export async function getRouteById(id: string): Promise<GetRouteByIdResponse> {
  const { data } = await api.get<GetRouteByIdResponse>(`/routes/${id}`);
  return {
    ...data,
    route: data.route ? normalizeRoute(data.route) : data.route,
  };
}
