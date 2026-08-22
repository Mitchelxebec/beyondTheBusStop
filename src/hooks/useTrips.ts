import { useQuery, useMutation, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import {
  createTrip,
  getTrip,
  startTrip,
  endTrip,
  shareTrip,
  getPublicTrip,
  getTripDirections,
  updateTripLocation,
} from "../services/trips";
import type {
  Trip,
  PublicTrip,
  TripDirections,
  CreateTripResponse,
  StartTripResponse,
  EndTripResponse,
  ShareTripResponse,
  UpdateLocationResponse,
} from "../types/trips";

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const TRIP_QUERY_KEYS = {
  detail: (tripId: string) => ["trips", "detail", tripId] as const,
  share: (tripId: string) => ["trips", "share", tripId] as const,
  public: (shareToken: string) => ["trips", "public", shareToken] as const,
  directions: (shareToken: string) => ["trips", "directions", shareToken] as const,
};

// ─── Queries ───────────────────────────────────────────────────────────────────

/** Fetch own trip by ID (auth required). */
export function useTrip(tripId?: string): UseQueryResult<Trip, Error> {
  return useQuery<Trip, Error>({
    queryKey: TRIP_QUERY_KEYS.detail(tripId ?? ""),
    queryFn: async () => {
      const res = await getTrip(tripId!);
      return res.trip;
    },
    enabled: Boolean(tripId),
  });
}

/** Fetch the share payload for a trip (auth required). */
export function useTripShare(tripId?: string): UseQueryResult<ShareTripResponse["share"], Error> {
  return useQuery<ShareTripResponse["share"], Error>({
    queryKey: TRIP_QUERY_KEYS.share(tripId ?? ""),
    queryFn: async () => {
      const res = await shareTrip(tripId!);
      return res.share;
    },
    enabled: Boolean(tripId),
  });
}

/** Fetch a public trip by shareToken (no auth required). */
export function usePublicTrip(shareToken?: string): UseQueryResult<PublicTrip, Error> {
  return useQuery<PublicTrip, Error>({
    queryKey: TRIP_QUERY_KEYS.public(shareToken ?? ""),
    queryFn: async () => {
      const res = await getPublicTrip(shareToken!);
      return res.trip;
    },
    enabled: Boolean(shareToken),
  });
}

/** Fetch public trip directions & polyline by shareToken (no auth required). Cached indefinitely for the session. */
export function useTripDirections(shareToken?: string): UseQueryResult<TripDirections, Error> {
  return useQuery<TripDirections, Error>({
    queryKey: TRIP_QUERY_KEYS.directions(shareToken ?? ""),
    queryFn: async () => {
      const res = await getTripDirections(shareToken!);
      return res.directions;
    },
    enabled: Boolean(shareToken),
    staleTime: Infinity,
    retry: 1,
  });
}

// ─── Mutations ─────────────────────────────────────────────────────────────────

/** Create a new trip from a routeId. */
export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation<CreateTripResponse, Error, string>({
    mutationFn: (routeId: string) => createTrip(routeId),
    onSuccess: (data) => {
      // Prime the detail cache immediately so a subsequent useTrip call is instant
      queryClient.setQueryData(
        TRIP_QUERY_KEYS.detail(data.trip._id),
        data.trip
      );
    },
  });
}

/** Start a trip (sets status → active). */
export function useStartTrip() {
  const queryClient = useQueryClient();
  return useMutation<StartTripResponse, Error, string>({
    mutationFn: (tripId: string) => startTrip(tripId),
    onSuccess: (data) => {
      queryClient.setQueryData(TRIP_QUERY_KEYS.detail(data.trip._id), data.trip);
    },
  });
}

/** End a trip (sets status → completed). */
export function useEndTrip() {
  const queryClient = useQueryClient();
  return useMutation<EndTripResponse, Error, string>({
    mutationFn: (tripId: string) => endTrip(tripId),
    onSuccess: (data) => {
      queryClient.setQueryData(TRIP_QUERY_KEYS.detail(data.trip._id), data.trip);
    },
  });
}

/** Update live GPS location while trip is active. */
export function useUpdateTripLocation() {
  return useMutation<
    UpdateLocationResponse,
    Error,
    { tripId: string; latitude: number; longitude: number }
  >({
    mutationFn: ({ tripId, latitude, longitude }) =>
      updateTripLocation(tripId, latitude, longitude),
  });
}
