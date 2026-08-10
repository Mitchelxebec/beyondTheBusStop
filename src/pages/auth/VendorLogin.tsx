import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { PrimaryButton, SecondaryButton, TextInput } from "../../components";
import { GoogleIcon, EyeIcon, LockIcon, MailIcon, OrDivider, AuthShell } from "./_shared";
import { useLogin } from "../../hooks/useLogin";
import { useState } from "react";

const schema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormValues = z.infer<typeof schema>;

const StoreIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="1.5" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1-5h16l1 5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 004 0 2 2 0 004 0 2 2 0 004 0 2 2 0 004 0" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 9v11h14V9" />
    <rect x="9" y="14" width="6" height="6" rx="1" />
  </svg>
);

const VendorLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { mutate: doLogin, isPending, error } = useLogin("business");

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: FormValues) => doLogin(values);

  return (
    <AuthShell>
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center shadow-sm">
        <StoreIcon />
      </div>

      <div className="flex flex-col gap-1 text-center w-full">
        <h1 className="text-xl font-bold text-gray-900">Vendor Login</h1>
        <p className="text-xs text-gray-500">Manage your listings and track performance.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full" noValidate>
        <TextInput
          label="Email Address"
          type="email"
          inputMode="email"
          placeholder="you@business.com"
          leadingIcon={<MailIcon />}
          error={!!errors.email?.message} helperText={errors.email?.message}
          {...register("email")}
        />

        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-xs font-medium text-gray-600">Password</span>
            <button type="button" onClick={() => navigate("/auth/forgot-password")}
              className="text-xs font-medium text-[#00C9A7] hover:underline">
              Forgot Password?
            </button>
          </div>
          <TextInput
            label=""
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leadingIcon={<LockIcon />}
            error={!!errors.password?.message} helperText={errors.password?.message}
            trailingIcon={
              <button type="button" aria-label={showPassword ? "Hide" : "Show"}
                onClick={() => setShowPassword(v => !v)}
                className="text-gray-400 hover:text-gray-600 transition-colors">
                <EyeIcon open={showPassword} />
              </button>
            }
            {...register("password")}
          />
        </div>

        {error && (
          <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error instanceof Error ? error.message : "Login failed. Try again."}
          </p>
        )}

        <div className="flex flex-col items-center gap-3 w-full">
          <PrimaryButton width="full" withArrow type="submit" disabled={isPending}>
            {isPending ? "Logging in…" : "Log In"}
          </PrimaryButton>

          <OrDivider />

          <SecondaryButton width="full" onClick={() => {}}>
            <GoogleIcon /> Continue with Google
          </SecondaryButton>
        </div>
      </form>

      <p className="text-xs text-gray-500 text-center">
        Don't have an account?{" "}
        <button type="button" onClick={() => navigate("/auth/vendor/register")}
          className="text-[#00C9A7] font-semibold hover:underline">
          Register your business
        </button>
      </p>
    </AuthShell>
  );
};

export default VendorLogin;

