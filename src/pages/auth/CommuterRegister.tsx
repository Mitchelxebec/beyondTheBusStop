import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { AppLogo, PrimaryButton, SecondaryButton, TextInput, Toast } from "../../components";
import { GoogleIcon, EyeIcon, LockIcon, UserIcon, MailIcon, OrDivider, AuthShell } from "./_shared";
import { useRegisterCommuter } from "../../hooks/useRegister";

const schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormValues = z.infer<typeof schema>;

const CommuterRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { mutate: doRegister, isPending, error } = useRegisterCommuter();

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

  const onSubmit = (values: FormValues) => doRegister(values);

  return (
    <AuthShell>
      <AppLogo size="sm" showWordmark />

      <div className="flex flex-col gap-1 text-center w-full">
        <h1 className="text-xl font-bold text-gray-900">Join the Pulse</h1>
        <p className="text-xs text-gray-500">Start your journey with real-time transit data.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full" noValidate>
        <TextInput
          label="Full Name"
          type="text"
          placeholder="Chidi Eze"
          leadingIcon={<UserIcon />}
          error={!!errors.fullName} helperText={errors.fullName?.message}
          {...register("fullName")}
        />

        <TextInput
          label="Email Address"
          type="email"
          inputMode="email"
          placeholder="hello@commuter.com"
          leadingIcon={<MailIcon />}
          error={!!errors.email} helperText={errors.email?.message}
          {...register("email")}
        />

        <TextInput
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          leadingIcon={<LockIcon />}
          error={!!errors.password} helperText={errors.password?.message}
          trailingIcon={
            <button type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(v => !v)}
              className="text-gray-400 hover:text-gray-600 transition-colors">
              <EyeIcon open={showPassword} />
            </button>
          }
          {...register("password")}
        />

        {error && (
          <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error instanceof Error ? error.message : "Registration failed. Try again."}
          </p>
        )}

        <div className="flex flex-col items-center gap-3 w-full">
          <PrimaryButton width="full" type="submit" disabled={isPending}>
            {isPending ? "Creating account…" : "Create Account"}
          </PrimaryButton>

          <OrDivider />

          <SecondaryButton width="full" type="button" onClick={handleGoogleClick}>
            <GoogleIcon /> Sign up with Google
          </SecondaryButton>
        </div>
      </form>

      <p className="text-xs text-gray-500 text-center">
        Already have an account?{" "}
        <button type="button" onClick={() => navigate("/auth/commuter/login")}
          className="text-[#00C9A7] font-semibold hover:underline">
          Log in
        </button>
      </p>

      <Toast message={toastMessage} />
    </AuthShell>
  );
};

export default CommuterRegister;
