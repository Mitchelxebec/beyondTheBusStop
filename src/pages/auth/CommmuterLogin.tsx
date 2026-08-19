import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { AppLogo, PrimaryButton, SecondaryButton, TextInput, Toast } from "../../components";
import { GoogleIcon, EyeIcon, LockIcon, OrDivider, AuthShell, MailIcon } from "./_shared";
import { useLogin } from "../../hooks/useLogin";
import { useState } from "react";

const schema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormValues = z.infer<typeof schema>;

// Detect the backend's role-mismatch message so we can offer a redirect link
const isVendorOnCommuterPage = (err: unknown): boolean => {
  if (!(err instanceof Error)) return false;
  return err.message.toLowerCase().includes("registered as a vendor");
};

const CommmuterLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { mutate: doLogin, isPending, error } = useLogin("commuter");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleGoogleClick = () => {
    showToast("Google sign-in is coming soon.");
  };

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: FormValues) => doLogin(values);

  return (
    <AuthShell>
      <AppLogo size="sm" showWordmark={false} />

      <div className="flex flex-col gap-1 text-center w-full">
        <h1 className="text-xl font-bold text-gray-900">Commuter Login</h1>
        <p className="text-xs text-gray-500">Track routes and verify fares in real-time.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full" noValidate>
        <TextInput
          label="Email Address"
          type="email"
          inputMode="email"
          placeholder="hello@commuter.com"
          leadingIcon={<MailIcon />}
          error={!!errors.email?.message} helperText={errors.email?.message}
          {...register("email")}
        />

        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-xs font-medium text-gray-600">Password</span>
            <button
              type="button"
              onClick={() => navigate("/auth/forgot-password")}
              className="text-xs font-medium text-[#00C9A7] hover:underline"
            >
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
          <div role="alert" className="flex flex-col gap-2 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <p className="text-red-600">
              {error instanceof Error ? error.message : "Login failed. Try again."}
            </p>
            {isVendorOnCommuterPage(error) && (
              <button
                type="button"
                onClick={() => navigate("/auth/vendor/login")}
                className="self-start font-semibold text-[#00C9A7] hover:underline"
              >
                Go to Vendor Login →
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col items-center gap-3 w-full">
          <PrimaryButton width="full" withArrow type="submit" disabled={isPending}>
            {isPending ? "Logging in…" : "Log In"}
          </PrimaryButton>

          <OrDivider />

          <SecondaryButton width="full" type="button" onClick={handleGoogleClick}>
            <GoogleIcon /> Login with Google
          </SecondaryButton>
        </div>
      </form>

      <p className="text-xs text-gray-500 text-center">
        Don't have an account?{" "}
        <button type="button" onClick={() => navigate("/auth/commuter/register")}
          className="text-[#00C9A7] font-semibold hover:underline">
          Sign up
        </button>
      </p>

      <Toast message={toastMessage} />
    </AuthShell>
  );
};

export default CommmuterLogin;

