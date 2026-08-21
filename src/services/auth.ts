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
  UpdateProfilePayload,
  UpdateProfileResponse,
  UploadAvatarResponse,
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

/** POST /auth/verify-otp */
export async function verifyOtp(
  payload: VerifyOtpPayload
): Promise<VerifyOtpResponse> {
  const { data } = await api.post<VerifyOtpResponse>("/auth/verify-otp", payload);
  return data;
}

/** POST /auth/resend-otp */
export async function resendOtp(email: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>("/auth/resend-otp", { email });
  return data;
}

/** GET /auth/profile — requires Bearer token */
export async function getProfile(): Promise<ProfileResponse> {
  const { data } = await api.get<ProfileResponse>("/auth/profile");
  return data;
}

/**
 * PATCH /auth/profile — requires Bearer token
 * Updates businessName, category, businessAddress for businesses, or fullName for commuters.
 */
export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<UpdateProfileResponse> {
  const { data } = await api.patch<UpdateProfileResponse>(
    "/auth/profile",
    payload
  );
  return data;
}

/**
 * POST /auth/profile/avatar — requires Bearer token
 * Uploads multipart form field `profilePicture` to Cloudinary.
 */
export async function uploadProfileAvatar(
  file: File
): Promise<UploadAvatarResponse> {
  const formData = new FormData();
  formData.append("profilePicture", file);

  const { data } = await api.post<UploadAvatarResponse>(
    "/auth/profile/avatar",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
}

