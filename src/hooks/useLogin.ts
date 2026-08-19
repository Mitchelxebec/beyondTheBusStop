import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";
import type { LoginPayload, UserRole } from "../types/auth";

/**
 * Login mutation — shared by CommmuterLogin and VendorLogin.
 * On success: stores session, then routes to returnPath if provided
 * (used after a session-expiry redirect), otherwise routes based on role:
 *   - commuter  → /home
 *   - business  → /vendor/home
 */
export function useLogin(role: UserRole, returnPath?: string) {
  const { setSession } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      login({ ...payload, expectedRole: role }),
    onSuccess: (data) => {
      setSession({ token: data.user.token, user: data.user, role });
      const destination = returnPath && returnPath !== "/" && !returnPath.startsWith("/auth/")
        ? returnPath
        : role === "business" ? "/vendor/home" : "/home";
      navigate(destination, { replace: true });
    },
  });
}
