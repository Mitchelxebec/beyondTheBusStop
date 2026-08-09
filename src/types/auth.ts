export type UserRole = "commuter" | "vendor";

/** User object returned inside login response */
export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  token: string; // JWT — lives inside user object per this API's shape
  role?: UserRole;
}

/** Full login response: { message, user } */
export interface LoginResponse {
  message: string;
  user: AuthUser;
}

/** Profile response: { success, data } */
export interface ProfileData {
  role: UserRole;
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  timestamp: string;
}

export interface ProfileResponse {
  success: boolean;
  data: ProfileData;
}

/** Register payload */
export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

/** Register response */
export interface RegisterResponse {
  message: string;
}

/** Login payload */
export interface LoginPayload {
  email: string;
  password: string;
}

/** What we store in context / localStorage */
export interface AuthSession {
  token: string;
  user: AuthUser;
  role: UserRole;
}
