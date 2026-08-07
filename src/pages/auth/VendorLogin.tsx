import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton, SecondaryButton, TextInput } from "../../components";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
  </svg>
);

/** Vendor store icon */
const StoreIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="1.5" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1-5h16l1 5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 004 0 2 2 0 004 0 2 2 0 004 0 2 2 0 004 0" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 9v11h14V9" />
    <rect x="9" y="14" width="6" height="6" rx="1" />
  </svg>
);

/**
 * Vendor login screen.
 * Fields: email address + password.
 * Options: Log In CTA, Forgot Password, Google OAuth, Register link.
 */
const VendorLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#F5F5F0] flex flex-col items-center px-6 pt-14 pb-12 gap-7">
      {/* Store icon */}
      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
        <StoreIcon />
      </div>

      {/* Heading */}
      <div className="flex flex-col gap-2 text-center w-full">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Login</h1>
        <p className="text-sm text-gray-500">Manage your listings and track performance.</p>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4 w-full">
        <TextInput
          label="Email Address"
          type="email"
          inputMode="email"
          placeholder="you@business.com"
          leadingIcon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />

        {/* Password row with inline Forgot Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <button
              type="button"
              onClick={() => navigate("/auth/forgot-password")}
              className="text-sm font-medium text-[#00C9A7]"
            >
              Forgot Password?
            </button>
          </div>
          <TextInput
            label=""
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leadingIcon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            }
            trailingIcon={
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            }
          />
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-4 w-full">
        <PrimaryButton withArrow onClick={() => navigate("/")}>
          Log In
        </PrimaryButton>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <SecondaryButton>
          <GoogleIcon />
          Continue with Google
        </SecondaryButton>
      </div>

      {/* Footer link */}
      <p className="text-sm text-gray-500 text-center mt-auto">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/auth/vendor/register")}
          className="text-[#00C9A7] font-semibold"
        >
          Register your business
        </button>
      </p>
    </main>
  );
};

export default VendorLogin;
