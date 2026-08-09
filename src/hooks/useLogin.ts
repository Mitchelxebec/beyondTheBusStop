import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";
import type { LoginPayload, UserRole } from "../types/auth";

/**
 * Login mutation shared by both CommmuterLogin and VendorLogin.
 * Role is passed in so we know which dashboard to redirect to after success.
 */
export function useLogin(role: UserRole) {
  const { setSession } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data) => {
      setSession({
        token: data.user.token,
        user:  data.user,
        role,
      });
      navigate(role === "vendor" ? "/vendor/dashboard" : "/commuter/dashboard");
    },
  });
}
