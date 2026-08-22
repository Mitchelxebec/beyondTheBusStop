// ─── Trip Types ────────────────────────────────────────────────────────────────
// Mirrors the backend Trip model and controller response shapes exactly.

export type TripStatus = "planned" | "active" | "completed" | "cancelled";
export type VehicleType = "bus" | "keke" | "taxi";
export type ConfidenceLevel = "High" | "Medium" | "Unconfirmed";

export interface TripPlace {
  placeId: string;
  name: string;
}

export interface TripLocation {
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export interface Trip {
  _id: string;
  userId: string;
  routeId: string;
  shareToken: string;
  origin: TripPlace;
  destination: TripPlace;
  vehicleType: VehicleType;
  boardingPoint: { name: string; placeId?: string };
  dropOffPoint: { name: string; placeId?: string };
  fareLow: number;
  fareHigh: number;
  confidenceScore?: number;
  confidenceLevel?: ConfidenceLevel;
  status: TripStatus;
  currentLocation?: TripLocation;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Public trip (returned by GET /trips/public/:shareToken) ───────────────────
// Omits userId — safe to expose without auth
export type PublicTrip = Omit<Trip, "userId" | "routeId" | "shareToken">;

// ─── API Response shapes ───────────────────────────────────────────────────────

export interface CreateTripResponse {
  success: boolean;
  message: string;
  trip: Trip;
}

export interface GetTripResponse {
  success: boolean;
  trip: Trip;
}

export interface StartTripResponse {
  success: boolean;
  message: string;
  trip: Trip;
}

export interface EndTripResponse {
  success: boolean;
  message: string;
  trip: Trip;
}

export interface ShareTripResponse {
  success: boolean;
  message: string;
  share: {
    tripId: string;
    shareToken: string;
    shareUrl: string;
    whatsappMessage: string;
  };
}

export interface GetPublicTripResponse {
  success: boolean;
  trip: PublicTrip;
}

export interface UpdateLocationResponse {
  success: boolean;
  message: string;
  location: TripLocation;
}

// ─── Public trip directions (returned by GET /trips/public/:shareToken/directions)
export interface TripDirections {
  encodedPolyline: string | null;
  distanceMeters: number | null;
  duration: string | null;
  originLocation: { latitude: number; longitude: number } | null;
  destinationLocation: { latitude: number; longitude: number } | null;
}

export interface GetTripDirectionsResponse {
  success: boolean;
  directions: TripDirections;
}
