import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { AppLogo, PrimaryButton, SecondaryButton, TextInput } from "../../components";
import { GoogleIcon, EyeIcon, LockIcon, OrDivider, AuthShell, MailIcon } from "./_shared";
import { useLogin } from "../../hooks/useLogin";
import { useState } from "react";

const schema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormValues = z.infer<typeof schema>;

const CommmuterLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { mutate: doLogin, isPending, error } = useLogin("commuter");

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
    </AuthShell>
  );
};

export default CommmuterLogin;

