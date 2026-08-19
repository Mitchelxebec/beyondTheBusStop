import axios from "axios";
import { tokenStorage } from "./tokenStorage";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://btbs-backend.onrender.com/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// ── Friendly error messages ────────────────────────────────────────────────
const FRIENDLY: Record<number, string> = {
  400: "Something doesn't look right. Please check your details and try again.",
  401: "Your session has expired. Please log in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for. Please try again.",
  409: "An account with these details already exists.",
  422: "Some of the information you entered isn't valid. Please check and try again.",
  429: "Too many attempts. Please wait a moment before trying again.",
  500: "Something went wrong on our end. Please try again shortly.",
  503: "Service is temporarily unavailable. Please try again in a moment.",
};

// ── 401 handler ─────────────────────────────────────────────────────────────
// When the backend says the session is expired, clear local storage and
// redirect to the role-appropriate login page so the user can get a fresh token.
// We do NOT show a dead toast and leave the user stranded mid-flow.
function handleSessionExpired(): void {
  const role = tokenStorage.getRole();
  tokenStorage.clear();

  // Avoid redirect loops on login pages themselves
  const path = window.location.pathname;
  if (path.startsWith("/auth/")) return;

  const loginPath = role === "business"
    ? "/auth/vendor/login"
    : "/auth/commuter/login";

  // Preserve the page they were on so we can send them back after re-login
  window.location.href = `${loginPath}?session_expired=1&return=${encodeURIComponent(path)}`;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status: number | undefined = error?.response?.status;

    // Auto-handle session expiry — clear and redirect rather than showing a dead error
    if (status === 401) {
      handleSessionExpired();
    }

    // Prefer backend's own message, fall back to friendly map, then generic
    const backendMessage: string | undefined = error?.response?.data?.message;
    const message =
      backendMessage ||
      (status ? FRIENDLY[status] : undefined) ||
      "Something went wrong. Please try again.";

    const normalised = new Error(message) as Error & { status?: number };
    normalised.status = status;
    return Promise.reject(normalised);
  }
);
