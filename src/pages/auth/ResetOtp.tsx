import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../lib/axios";
import { BackButton } from "../../components";

const OTP_LENGTH = 6;
const COUNTDOWN_SECONDS = 60;

// Lock icon — visually distinct from VerifyEmail's shield
const LockBadge = () => (
  <div className="relative w-14 h-14 flex items-center justify-center">
    <div className="absolute inset-0 rounded-full bg-gray-200/50" />
    <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shadow-sm">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
        <circle cx="12" cy="16" r="1.5" fill="#1A1A1A" />
      </svg>
    </div>
  </div>
);

const ResetOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email ?? "";

  const [digits, setDigits]       = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown(s => {
        if (s <= 1) { clearInterval(timerRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  const restartCountdown = () => {
    clearInterval(timerRef.current!);
    setCountdown(COUNTDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setCountdown(s => {
        if (s <= 1) { clearInterval(timerRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  // Verify OTP for password reset — uses the same /auth/verify-otp endpoint
  const { mutate: doVerify, isPending, error } = useMutation({
    mutationFn: () =>
      api.post("/auth/verify-otp", { email, otp: digits.join("") }).then(r => r.data),
    onSuccess: () =>
      navigate("/auth/reset-password", { state: { email, otp: digits.join("") } }),
  });

  // Resend OTP
  const { mutate: doResend, isPending: resending, isSuccess: resent, error: resendError } = useMutation({
    mutationFn: () =>
      api.post("/auth/resend-otp", { email }).then(r => r.data),
    onSuccess: () => restartCountdown(),
    onError: () => {},
  });

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/, "").slice(-1);
    const next = [...digits];
    next[i] = digit;
    setDigits(next);
    if (digit && i < OTP_LENGTH - 1) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = [...digits];
    pasted.split("").forEach((d, idx) => { next[idx] = d; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const isComplete = digits.every(d => d !== "");
  const canResend  = countdown === 0 && !resending;
  const pad        = (n: number) => String(n).padStart(2, "0");

  return (
    <main className="min-h-screen bg-[#F5F5F0] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg px-8 py-10 flex flex-col items-center gap-6">

        {/* Back */}
        <div className="self-start">
          <BackButton onClick={() => navigate(-1)} />
        </div>

        <LockBadge />

        {/* Heading */}
        <div className="flex flex-col gap-1.5 text-center">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Enter Code</h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            We sent a password reset code to{" "}
            <span className="font-semibold text-gray-700">{email || "your email"}</span>
          </p>
        </div>

        {/* OTP boxes */}
        <div
          className="flex justify-center gap-3 w-full"
          role="group"
          aria-label="Reset code"
          onPaste={handlePaste}
        >
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digits[i]}
              aria-label={`Digit ${i + 1}`}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`
                w-10 h-10 rounded-full text-center text-base font-bold
                outline-none transition-all duration-150
                ${digits[i]
                  ? "bg-[#F5B800]/10 text-gray-900 ring-2 ring-[#F5B800]/50 scale-105"
                  : "bg-gray-100 text-gray-400 focus:bg-[#F5B800]/10 focus:ring-2 focus:ring-[#F5B800]/30"
                }
              `}
            />
          ))}
        </div>

        {/* Countdown + resend */}
        <div className="flex flex-col items-center gap-1.5">
          {countdown > 0 ? (
            <p className="text-xs text-gray-400">
              Resend code in{" "}
              <span className="font-bold text-gray-700 tabular-nums">0:{pad(countdown)}</span>
            </p>
          ) : resent ? (
            <span className="text-xs text-[#00C9A7] font-semibold">Code resent!</span>
          ) : resendError ? (
            <span className="text-xs text-orange-500 text-center leading-relaxed">
              Resend unavailable. Check your inbox or try again later.
            </span>
          ) : (
            <button
              type="button"
              disabled={!canResend}
              onClick={() => doResend()}
              className="text-xs font-semibold text-[#00C9A7] hover:underline disabled:opacity-40 transition-opacity"
            >
              {resending ? "Sending…" : "Resend code now"}
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <p role="alert" className="text-xs text-red-500 text-center w-full -mt-2">
            {(() => {
              const status = (error as Error & { status?: number }).status;
              if (status === 400) return "Invalid or expired code. Please check and try again.";
              if (status === 404) return "We couldn't find your account. Please go back and re-enter your email.";
              if (status === 429) return "Too many attempts. Please wait a moment before trying again.";
              return "Something went wrong. Please try again.";
            })()}
          </p>
        )}

        {/* CTA */}
        <button
          type="button"
          disabled={!isComplete || isPending}
          onClick={() => doVerify()}
          className="w-full py-3.5 rounded-full bg-[#F5B800] text-[#1A1A1A] font-semibold text-sm
            shadow-[0_4px_14px_rgba(245,184,0,0.35)]
            hover:bg-[#FFCA28] active:scale-[0.97]
            transition-all duration-150
            disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isPending ? "Verifying…" : "Verify Code"}
        </button>

      </div>
    </main>
  );
};

export default ResetOtp;
