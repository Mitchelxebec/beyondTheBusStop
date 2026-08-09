import { api } from "../lib/axios";
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ProfileResponse,
} from "../types/auth";

/** POST /auth/register */
export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>("/auth/register", payload);
  return data;
}

/** POST /auth/login — works for both commuter and vendor */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", payload);
  return data;
}

/** GET /auth/profile — requires Bearer token */
export async function getProfile(): Promise<ProfileResponse> {
  const { data } = await api.get<ProfileResponse>("/auth/profile");
  return data;
}
