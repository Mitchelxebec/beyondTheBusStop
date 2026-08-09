import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLogo, PrimaryButton, SecondaryButton, TextInput } from "../../components";
import { GoogleIcon, EyeIcon, LockIcon, MailIcon, OrDivider, AuthShell } from "./_shared";

const CATEGORIES = [
  "Food & Drinks",
  "Clothing & Fashion",
  "Electronics & Repairs",
  "Health & Pharmacy",
  "Transport Services",
  "Market & Grocery",
  "Other",
];

const VendorRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <AuthShell>
      <AppLogo size="sm" showWordmark />

      <div className="flex flex-col gap-1 text-center w-full">
        <h1 className="text-xl font-bold text-gray-900">Register your Business</h1>
        <p className="text-xs text-gray-500">Connect with thousands of daily commuters.</p>
      </div>

      <div className="flex flex-col gap-3 w-full">
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

        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-xs font-medium text-gray-600 px-0.5">
            Category
          </label>
          <div className="relative bg-gray-50 border border-gray-200 rounded-lg focus-within:border-gray-400 transition-colors">
            <select
              id="category"
              defaultValue=""
              className="w-full bg-transparent text-sm text-gray-900 px-3.5 py-2.5 outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled>Select Category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <svg
              className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 w-full">
        <PrimaryButton width="full" onClick={() => {}}>
          Register Business
        </PrimaryButton>

        <OrDivider />

        <SecondaryButton width="full" onClick={() => {}}>
          <GoogleIcon /> Register with Google
        </SecondaryButton>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Already have a business account?{" "}
        <button
          type="button"
          onClick={() => navigate("/auth/vendor/login")}
          className="text-[#00C9A7] font-semibold hover:underline"
        >
          Log in
        </button>
      </p>
    </AuthShell>
  );
};

export default VendorRegister;
