import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { registerCommuter, registerBusiness } from "../services/auth";
import type {
  RegisterCommuterPayload,
  RegisterBusinessPayload,
} from "../types/auth";

/**
 * Register commuter mutation.
 * On success → redirect to OTP verification page.
 */
export function useRegisterCommuter() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterCommuterPayload) => registerCommuter(payload),
    onSuccess: (_data, variables) => {
      // Pass email via state so OTP page can pre-fill it
      navigate("/auth/verify-otp", { state: { email: variables.email } });
    },
  });
}

/**
 * Register business mutation.
 * On success → redirect to OTP verification page.
 */
export function useRegisterBusiness() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterBusinessPayload) => registerBusiness(payload),
    onSuccess: (_data, variables) => {
      navigate("/auth/verify-otp", { state: { email: variables.email } });
    },
  });
}
