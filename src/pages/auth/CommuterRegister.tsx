import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLogo, PrimaryButton, SecondaryButton, TextInput } from "../../components";
import { GoogleIcon, EyeIcon, LockIcon, UserIcon, MailIcon, OrDivider, AuthShell } from "./_shared";

const CommuterRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <AuthShell>
      <AppLogo size="sm" showWordmark />

      <div className="flex flex-col gap-1 text-center w-full">
        <h1 className="text-xl font-bold text-gray-900">Join the Pulse</h1>
        <p className="text-xs text-gray-500">Start your journey with real-time transit data.</p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <TextInput
          label="Full Name"
          type="text"
          placeholder="Chidi Eze"
          leadingIcon={<UserIcon />}
        />

        <TextInput
          label="Email Address"
          type="email"
          inputMode="email"
          placeholder="hello@commuter.com"
          leadingIcon={<MailIcon />}
        />

        <TextInput
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          leadingIcon={<LockIcon />}
          trailingIcon={
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(v => !v)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <EyeIcon open={showPassword} />
            </button>
          }
        />
      </div>

      <div className="flex flex-col items-center gap-3 w-full">
        <PrimaryButton width="full" onClick={() => {}}>
          Create Account
        </PrimaryButton>

        <OrDivider />

        <SecondaryButton width="full" onClick={() => {}}>
          <GoogleIcon /> Sign up with Google
        </SecondaryButton>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/auth/commuter/login")}
          className="text-[#00C9A7] font-semibold hover:underline"
        >
          Log in
        </button>
      </p>
    </AuthShell>
  );
};

export default CommuterRegister;
