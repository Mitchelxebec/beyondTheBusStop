import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { verifyOtp, resendOtp } from "../../services/auth";
import { useAuth } from "../../contexts/AuthContext";

const OTP_LENGTH = 6;
const COUNTDOWN_SECONDS = 60;

const ShieldIcon = () => (
  <div className="relative w-14 h-14 flex items-center justify-center">
    <div className="absolute inset-0 rounded-full bg-[#F5B800]/15" />
    <div className="w-12 h-12 rounded-full bg-[#F5B800]/20 border border-[#F5B800]/30 flex items-center justify-center">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F5B800" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11 4.5-.85 8-5.75 8-11V6l-8-4z" />
        <circle cx="12" cy="11" r="2" fill="#F5B800" stroke="none" />
      </svg>
    </div>
  </div>
);

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();

  const state = (location.state ?? {}) as { email?: string; role?: string };
  const email = state.email ?? "";
  const role  = state.role  ?? session?.role ?? "commuter";

  const [digits, setDigits]     = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown on mount
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown(s => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
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

  const { mutate: doVerify, isPending, error } = useMutation({
    mutationFn: () => verifyOtp({ email, otp: digits.join("") }),
    onSuccess: () =>
      navigate(role === "business" ? "/vendor/home" : "/home", { replace: true }),
  });

  const { mutate: doResend, isPending: resending, isSuccess: resent, error: resendError } = useMutation({
    mutationFn: () => resendOtp(email),
    onSuccess: () => restartCountdown(),
    // Don't throw — backend endpoint may not be deployed yet
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

  const isComplete   = digits.every(d => d !== "");
  const canResend    = countdown === 0 && !resending;
  const pad          = (n: number) => String(n).padStart(2, "0");

  return (
    <main className="min-h-screen bg-[#F5F5F0] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg px-8 py-10 flex flex-col items-center gap-6">

        <ShieldIcon />

        {/* Heading */}
        <div className="flex flex-col gap-1.5 text-center">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Enter Code</h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            We sent an OTP code to{" "}
            <span className="font-semibold text-gray-700">{email || "your email address"}</span>
          </p>
        </div>

        {/* OTP boxes */}
        <div
          className="flex justify-center gap-3 w-full"
          role="group"
          aria-label="Verification code"
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
              <span className="font-bold text-gray-700 tabular-nums">
                0:{pad(countdown)}
              </span>
            </p>
          ) : resent ? (
            <span className="text-xs text-[#00C9A7] font-semibold">Code resent!</span>
          ) : resendError ? (
            <span className="text-xs text-orange-500 text-center leading-relaxed">
              Resend unavailable right now.<br />Check your inbox or try again later.
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
            {error instanceof Error ? error.message : "Something went wrong. Please try again."}
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
          {isPending ? "Verifying…" : "Verify Email"}
        </button>

      </div>
    </main>
  );
};

export default VerifyEmail;
