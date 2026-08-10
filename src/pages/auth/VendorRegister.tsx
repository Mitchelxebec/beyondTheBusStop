import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { AppLogo, PrimaryButton, SecondaryButton, TextInput } from "../../components";
import { GoogleIcon, EyeIcon, LockIcon, MailIcon, OrDivider, AuthShell } from "./_shared";
import { useRegisterBusiness } from "../../hooks/useRegister";

const CATEGORIES = [
  "Food & Drinks",
  "Clothing & Fashion",
  "Electronics & Repairs",
  "Health & Pharmacy",
  "Transport Services",
  "Market & Grocery",
  "Other",
];

const schema = z.object({
  businessName: z.string().min(2, "Enter your business name"),
  email:        z.string().email("Enter a valid email"),
  password:     z.string().min(6, "Password must be at least 6 characters"),
  category:     z.string().min(1, "Select a category"),
});
type FormValues = z.infer<typeof schema>;

const VendorRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { mutate: doRegister, isPending, error } = useRegisterBusiness();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: "" },
  });

  const onSubmit = (values: FormValues) => doRegister(values);

  return (
    <AuthShell>
      <AppLogo size="sm" showWordmark />

      <div className="flex flex-col gap-1 text-center w-full">
        <h1 className="text-xl font-bold text-gray-900">Register your Business</h1>
        <p className="text-xs text-gray-500">Connect with thousands of daily commuters.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full" noValidate>
        <TextInput
          label="Business Name"
          type="text"
          placeholder="e.g. Iya Basira Foods"
          error={!!errors.businessName} helperText={errors.businessName?.message}
          {...register("businessName")}
        />

        <TextInput
          label="Email Address"
          type="email"
          inputMode="email"
          placeholder="hello@business.com"
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

        {/* Category select */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-xs font-medium text-gray-600 px-0.5">
            Category
          </label>
          <div className={`relative bg-gray-50 border rounded-lg transition-colors ${errors.category ? "border-red-400" : "border-gray-200 focus-within:border-gray-400"}`}>
            <select
              id="category"
              className="w-full bg-transparent text-sm text-gray-900 px-3.5 py-2.5 outline-none appearance-none cursor-pointer"
              {...register("category")}
            >
              <option value="" disabled>Select Category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {errors.category && (
            <p className="text-xs text-red-500 px-0.5">{errors.category.message}</p>
          )}
        </div>

        {error && (
          <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error instanceof Error ? error.message : "Registration failed. Try again."}
          </p>
        )}

        <div className="flex flex-col items-center gap-3 w-full">
          <PrimaryButton width="full" type="submit" disabled={isPending}>
            {isPending ? "Registering…" : "Register Business"}
          </PrimaryButton>

          <OrDivider />

          <SecondaryButton width="full" type="button" onClick={() => {}}>
            <GoogleIcon /> Register with Google
          </SecondaryButton>
        </div>
      </form>

      <p className="text-xs text-gray-500 text-center">
        Already have a business account?{" "}
        <button type="button" onClick={() => navigate("/auth/vendor/login")}
          className="text-[#00C9A7] font-semibold hover:underline">
          Log in
        </button>
      </p>
    </AuthShell>
  );
};

export default VendorRegister;
