import { api } from "../lib/axios";
import type {
  CreateRoutePayload,
  CreateRouteResponse,
  GetAllRoutesResponse,
  SearchRoutesResponse,
  GetRouteByIdResponse,
} from "../types/routes";

/** POST /routes/create — requires Bearer token */
export async function createRoute(
  payload: CreateRoutePayload
): Promise<CreateRouteResponse> {
  const { data } = await api.post<CreateRouteResponse>("/routes/create", payload);
  return data;
}

/** GET /routes */
export async function getAllRoutes(): Promise<GetAllRoutesResponse> {
  const { data } = await api.get<GetAllRoutesResponse>("/routes");
  return data;
}

/** GET /routes/search?destination= */
export async function searchRoutes(
  destination: string
): Promise<SearchRoutesResponse> {
  const { data } = await api.get<SearchRoutesResponse>("/routes/search", {
    params: { destination },
  });
  return data;
}

/** GET /routes/:id */
export async function getRouteById(id: string): Promise<GetRouteByIdResponse> {
  const { data } = await api.get<GetRouteByIdResponse>(`/routes/${id}`);
  return data;
}
