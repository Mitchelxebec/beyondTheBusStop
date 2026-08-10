import { api } from "../lib/axios";
import type {
  LoginPayload,
  LoginResponse,
  RegisterCommuterPayload,
  RegisterCommuterResponse,
  RegisterBusinessPayload,
  RegisterBusinessResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
  ProfileResponse,
} from "../types/auth";

/** POST /auth/register-commuter */
export async function registerCommuter(
  payload: RegisterCommuterPayload
): Promise<RegisterCommuterResponse> {
  const { data } = await api.post<RegisterCommuterResponse>(
    "/auth/register-commuter",
    payload
  );
  return data;
}

/** POST /auth/register-business */
export async function registerBusiness(
  payload: RegisterBusinessPayload
): Promise<RegisterBusinessResponse> {
  const { data } = await api.post<RegisterBusinessResponse>(
    "/auth/register-business",
    payload
  );
  return data;
}

/** POST /auth/login — shared by commuter and business */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", payload);
  return data;
}

/** GET /auth/verify-otp — verify the OTP sent after registration */
export async function verifyOtp(
  payload: VerifyOtpPayload
): Promise<VerifyOtpResponse> {
  const { data } = await api.get<VerifyOtpResponse>("/auth/verify-otp", {
    data: payload,
  });
  return data;
}

/** GET /auth/resend-otp */
export async function resendOtp(email: string): Promise<{ message: string }> {
  const { data } = await api.get<{ message: string }>("/auth/resend-otp", {
    data: { email },
  });
  return data;
}

/** GET /auth/profile — requires Bearer token */
export async function getProfile(): Promise<ProfileResponse> {
  const { data } = await api.get<ProfileResponse>("/auth/profile");
  return data;
}
