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
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Normalise errors so useMutation.error.message is always a string
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";
    const normalised = new Error(message) as Error & { status?: number };
    normalised.status = error?.response?.status;
    return Promise.reject(normalised);
  }
);
