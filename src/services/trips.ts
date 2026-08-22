import { api } from "../lib/axios";
import type {
  CreateTripResponse,
  GetTripResponse,
  StartTripResponse,
  EndTripResponse,
  ShareTripResponse,
  GetPublicTripResponse,
  UpdateLocationResponse,
  GetTripDirectionsResponse,
} from "../types/trips";

/** POST /trips — creates a trip from a routeId, generates shareToken automatically */
export async function createTrip(routeId: string): Promise<CreateTripResponse> {
  const { data } = await api.post<CreateTripResponse>("/trips", { routeId });
  return data;
}

/** GET /trips/:tripId — get own trip (auth required) */
export async function getTrip(tripId: string): Promise<GetTripResponse> {
  const { data } = await api.get<GetTripResponse>(`/trips/${tripId}`);
  return data;
}

/** PATCH /trips/:tripId/start — marks trip as active */
export async function startTrip(tripId: string): Promise<StartTripResponse> {
  const { data } = await api.patch<StartTripResponse>(`/trips/${tripId}/start`);
  return data;
}

/** PATCH /trips/:tripId/end — marks trip as completed */
export async function endTrip(tripId: string): Promise<EndTripResponse> {
  const { data } = await api.patch<EndTripResponse>(`/trips/${tripId}/end`);
  return data;
}

/** GET /trips/:tripId/share — returns shareToken, shareUrl, whatsappMessage */
export async function shareTrip(tripId: string): Promise<ShareTripResponse> {
  const { data } = await api.get<ShareTripResponse>(`/trips/${tripId}/share`);
  return data;
}

/** GET /trips/public/:shareToken — no auth required, for recipients */
export async function getPublicTrip(shareToken: string): Promise<GetPublicTripResponse> {
  const { data } = await api.get<GetPublicTripResponse>(`/trips/public/${shareToken}`);
  return data;
}

/** GET /trips/public/:shareToken/directions — returns route directions & polyline (no auth required) */
export async function getTripDirections(shareToken: string): Promise<GetTripDirectionsResponse> {
  const { data } = await api.get<GetTripDirectionsResponse>(`/trips/public/${shareToken}/directions`);
  return data;
}

/** PATCH /trips/:tripId/location — update live GPS while trip is active */
export async function updateTripLocation(
  tripId: string,
  latitude: number,
  longitude: number
): Promise<UpdateLocationResponse> {
  const { data } = await api.patch<UpdateLocationResponse>(`/trips/${tripId}/location`, {
    latitude,
    longitude,
  });
  return data;
}
