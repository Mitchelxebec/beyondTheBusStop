import { io, Socket } from "socket.io-client";

// Determine the Socket.IO server URL based on API base URL
const apiBase =
  import.meta.env.VITE_API_BASE_URL || "https://btbs-backend.onrender.com/api";
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || apiBase.replace(/\/api\/?$/, "");

let socketInstance: Socket | null = null;

/**
 * Returns the singleton Socket.IO client instance.
 * Lazily initializes on first call.
 */
export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
}

// ─── Socket Event Types ────────────────────────────────────────────────────────

export interface LocationUpdatePayload {
  shareToken: string;
  latitude: number;
  longitude: number;
}

export interface LocationUpdatedEvent {
  tripId: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export interface TripErrorEvent {
  message: string;
}
