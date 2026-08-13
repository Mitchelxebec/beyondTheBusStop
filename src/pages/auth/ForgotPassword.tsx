import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../lib/axios";
import { BackButton, PrimaryButton, TextInput } from "../../components";
import { MailIcon } from "./_shared";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type FormValues = z.infer<typeof schema>;

const ResetIcon = () => (
  <div className="relative w-16 h-16 flex items-center justify-center">
    <div className="absolute inset-0 rounded-full bg-gray-200/60" />
    <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shadow-sm">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </div>
  </div>
);

const ForgotPassword = () => {
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (payload: FormValues) =>
      api.post("/auth/forgot-password", payload).then(r => r.data),
    onSuccess: (_data, variables) => {
      navigate("/auth/reset-otp", { state: { email: variables.email } });
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <main className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Gradient bar top */}
        <div className="h-1 w-full bg-linear-to-r from-[#F5B800] via-[#00C9A7] to-[#F5B800]" />

        <div className="flex flex-col items-center gap-5 px-6 pt-8 pb-8">
          {/* Back + icon row */}
          <div className="w-full flex items-center justify-between">
            <BackButton onClick={() => navigate(-1)} />
            <ResetIcon />
            <div className="w-8" /> {/* spacer to centre icon */}
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-lg font-bold text-gray-900">Forgot Password</h1>
            <p className="text-xs text-gray-500 leading-relaxed">
              Enter your registered email address and we'll send you a recovery link.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(v => mutate(v))}
            className="flex flex-col gap-4 w-full"
            noValidate
          >
            <TextInput
              label="Email Address"
              type="email"
              inputMode="email"
              placeholder="hello@example.com"
              leadingIcon={<MailIcon />}
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register("email")}
            />

            {error && (
              <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
                {error instanceof Error ? error.message : "Something went wrong."}
              </p>
            )}

            <PrimaryButton width="full" type="submit" disabled={isPending}>
              {isPending ? "Sending…" : "Send Code"}
            </PrimaryButton>
          </form>

          {/* Back to login */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors font-medium"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
