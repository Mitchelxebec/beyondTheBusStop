export type UserRole = "commuter" | "business";

/* ── Login ──────────────────────────────────────────────────────────────── */

export interface LoginPayload {
  email: string;
  password: string;
}

/** User object returned inside login/register responses */
export interface AuthUser {
  id: string;
  _id?: string;
  fullName?: string;
  businessName?: string;
  category?: string;
  email: string;
  role: UserRole;
  token: string; // JWT lives inside user object per this API
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
}

/* ── Register commuter ───────────────────────────────────────────────────── */

export interface RegisterCommuterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterCommuterResponse {
  message: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: "commuter";
  };
}

/* ── Register business ───────────────────────────────────────────────────── */

export interface RegisterBusinessPayload {
  businessName: string;
  email: string;
  password: string;
  category: string;
}

export interface RegisterBusinessResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    businessName: string;
    email: string;
    category: string;
    role: "business";
  };
}

/* ── OTP ─────────────────────────────────────────────────────────────────── */

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
}

/* ── Profile ─────────────────────────────────────────────────────────────── */

export interface ProfileData {
  role: UserRole;
  _id: string;
  fullName?: string;
  businessName?: string;
  category?: string;
  email: string;
  isVerified: boolean;
  timestamp: string;
}

export interface ProfileResponse {
  success: boolean;
  data: ProfileData;
}

/* ── Session (stored in context / localStorage) ───────────────────────────── */

export interface AuthSession {
  token: string;
  user: AuthUser;
  role: UserRole;
}
