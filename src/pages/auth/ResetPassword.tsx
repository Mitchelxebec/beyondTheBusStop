import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../lib/axios";
import { BackButton, PrimaryButton, TextInput } from "../../components";
import { EyeIcon, LockIcon } from "./_shared";

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm:  z.string(),
}).refine(d => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ["confirm"],
});
type FormValues = z.infer<typeof schema>;

/* Password strength bar */
const getStrength = (pw: string): number => {
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw))    score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0–5
};

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
const strengthColor  = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-[#00C9A7]", "bg-[#00C9A7]"];

const ResetIcon = () => (
  <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shadow-sm">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  </div>
);

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = (location.state ?? {}) as { email?: string; otp?: string };

  const [showPw, setShowPw]      = useState(false);
  const [showConfirm, setConfirm] = useState(false);
  const [pwValue, setPwValue]    = useState("");

  const { mutate, isPending, error } = useMutation({
    mutationFn: (payload: { email: string; otp: string; newPassword: string }) =>
      api.post("/auth/reset-password", payload).then(r => r.data),
    onSuccess: () => navigate("/auth/reset-success"),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: FormValues) => {
    if (!email || !otp) return;
    mutate({ email, otp, newPassword: values.password });
  };

  const strength = getStrength(pwValue);

  return (
    <main className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">

        <div className="w-full flex items-center justify-between">
          <BackButton onClick={() => navigate(-1)} />
          <ResetIcon />
          <div className="w-8" />
        </div>

        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            Create a new, strong password for your account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-full"
          noValidate
        >
          {/* New password + strength bar */}
          <div className="flex flex-col gap-1.5">
            <TextInput
              label="New Password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              leadingIcon={<LockIcon />}
              error={!!errors.password}
              helperText={errors.password?.message}
              trailingIcon={
                <button type="button" aria-label={showPw ? "Hide" : "Show"}
                  onClick={() => setShowPw(v => !v)}
                  className="text-gray-400 hover:text-gray-600 transition-colors">
                  <EyeIcon open={showPw} />
                </button>
              }
              {...register("password", {
                onChange: e => setPwValue(e.target.value),
              })}
            />
            {/* Strength bar */}
            {pwValue && (
              <div className="flex items-center gap-2 px-0.5">
                <div className="flex gap-1 flex-1">
                  {[1,2,3,4,5].map(n => (
                    <div
                      key={n}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= strength ? strengthColor[strength] : "bg-gray-200"}`}
                    />
                  ))}
                </div>
                <span className={`text-[10px] font-semibold shrink-0 ${strength >= 4 ? "text-[#00C9A7]" : strength >= 2 ? "text-orange-400" : "text-red-400"}`}>
                  {strengthLabel[strength]}
                </span>
              </div>
            )}
          </div>

          <TextInput
            label="Confirm Password"
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            leadingIcon={<LockIcon />}
            error={!!errors.confirm}
            helperText={errors.confirm?.message}
            trailingIcon={
              <button type="button" aria-label={showConfirm ? "Hide" : "Show"}
                onClick={() => setConfirm(v => !v)}
                className="text-gray-400 hover:text-gray-600 transition-colors">
                <EyeIcon open={showConfirm} />
              </button>
            }
            {...register("confirm")}
          />

          {error && (
            <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
              {error instanceof Error ? error.message : "Something went wrong."}
            </p>
          )}

          <PrimaryButton width="full" withArrow type="submit" disabled={isPending}>
            {isPending ? "Updating…" : "Update Password"}
          </PrimaryButton>
        </form>

      </div>
    </main>
  );
};

export default ResetPassword;
