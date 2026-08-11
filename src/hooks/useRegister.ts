import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { registerCommuter, registerBusiness } from "../services/auth";
import type { RegisterCommuterPayload, RegisterBusinessPayload } from "../types/auth";

/**
 * Register commuter → on success redirect to OTP verification.
 * Passes email + role through location state so VerifyEmail knows where to go after.
 */
export function useRegisterCommuter() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: RegisterCommuterPayload) => registerCommuter(payload),
    onSuccess: (_data, variables) => {
      navigate("/auth/verify-email", {
        state: { email: variables.email, role: "commuter" },
      });
    },
  });
}

/**
 * Register business → on success redirect to OTP verification.
 */
export function useRegisterBusiness() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: RegisterBusinessPayload) => registerBusiness(payload),
    onSuccess: (_data, variables) => {
      navigate("/auth/verify-email", {
        state: { email: variables.email, role: "business" },
      });
    },
  });
}
