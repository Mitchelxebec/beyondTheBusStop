import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLogo, PrimaryButton, SecondaryButton, TextInput } from "../../components";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
  </svg>
);

const CATEGORIES = [
  "Food & Drinks",
  "Clothing & Fashion",
  "Electronics & Repairs",
  "Health & Pharmacy",
  "Transport Services",
  "Market & Grocery",
  "Other",
];

/**
 * Vendor registration — "Register your Business".
 * Fields: business name, email, password, category (select).
 * Options: Register CTA, Google OAuth, Log in link.
 */
const VendorRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#F5F5F0] flex flex-col items-center px-6 pt-14 pb-12 gap-7">
      {/* Logo */}
      <AppLogo size="sm" showWordmark />

      {/* Heading */}
      <div className="flex flex-col gap-2 text-center w-full">
        <h1 className="text-2xl font-bold text-gray-900">Register your Business</h1>
        <p className="text-sm text-gray-500">Connect with thousands of daily commuters.</p>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4 w-full">
        <TextInput
          label="Business Name"
          type="text"
          placeholder="e.g. Iya Basira Foods"
        />

        <TextInput
          label="Email Address"
          type="email"
          inputMode="email"
          placeholder="hello@business.com"
        />

        <TextInput
          label="Password"
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

        {/* Category select */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-sm font-medium text-gray-700 px-1">
            Category
          </label>
          <div className="relative bg-gray-50 border border-gray-200 rounded-lg focus-within:border-gray-400 transition-colors">
            <select
              id="category"
              defaultValue=""
              className="w-full bg-transparent text-sm text-gray-900 px-4 py-3.5 outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled>Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {/* Chevron */}
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-4 w-full">
        <PrimaryButton onClick={() => navigate("/auth/phone")}>
          Register Business
        </PrimaryButton>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <SecondaryButton>
          <GoogleIcon />
          Register with Google
        </SecondaryButton>
      </div>

      {/* Footer link */}
      <p className="text-sm text-gray-500 text-center mt-auto">
        Already have a business account?{" "}
        <button
          type="button"
          onClick={() => navigate("/auth/vendor/login")}
          className="text-[#00C9A7] font-semibold"
        >
          Log in
        </button>
      </p>
    </main>
  );
};

export default VendorRegister;
