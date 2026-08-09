import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { StepDots, PrimaryButton } from "../../components";

/* ── Illustrations ─────────────────────────────────────────────────────────── */

const FareIllustration = () => (
  <div className="relative flex items-center justify-center w-52 h-52">
    <div className="absolute w-40 h-40 rounded-full bg-gray-200/80" />
    <div className="relative z-10 bg-white rounded-2xl border-2 border-[#F5B800] px-5 py-4 shadow-md flex gap-2 items-center">
      <span className="w-2.5 h-2.5 rounded-full bg-[#F5B800]" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#F5B800]" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#F5B800]" />
    </div>
    <div className="absolute bottom-10 left-4 bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
      ₦150 – ₦200
    </div>
    <div className="absolute top-8 right-6 w-8 h-8 rounded-xl bg-[#E8FAF5] border border-[#00C9A7]/30 flex items-center justify-center">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="2.5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  </div>
);

const RouteIllustration = () => (
  <div className="relative flex items-center justify-center w-52 h-52">
    <div className="absolute top-0 left-8 w-28 h-28 rounded-full bg-[#00C9A7]/10" />
    <div className="relative z-10 bg-white rounded-2xl shadow-md border border-gray-100 p-3 w-44">
      <div className="flex items-center justify-between mb-2">
        <span className="bg-[#00C9A7] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          Ojota → CMS
        </span>
        <span className="w-6 h-6 rounded-full bg-[#F5B800] flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      </div>
      <div className="h-20 bg-gray-100 rounded-xl p-2">
        <svg viewBox="0 0 100 60" className="w-full h-full" aria-hidden="true">
          <path d="M10 50 Q30 20 55 30 Q75 38 90 10" stroke="#1A1A1A" strokeWidth="3" fill="none" strokeDasharray="5 4" strokeLinecap="round" />
          <circle cx="10" cy="50" r="5" fill="#1A1A1A" />
          <circle cx="90" cy="10" r="5" fill="#1A1A1A" />
        </svg>
      </div>
    </div>
    <div className="absolute bottom-2 right-4 w-20 h-20 rounded-full bg-[#F5B800]/15" />
  </div>
);

const SafetyIllustration = () => (
  <div className="relative flex items-center justify-center w-52 h-52">
    <div className="absolute w-44 h-44 rounded-full bg-[#00C9A7]/10 border border-[#00C9A7]/20" />
    <div className="relative z-10 w-20 h-20 flex items-center justify-center">
      <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11 4.5-.85 8-5.75 8-11V6l-8-4z"
          fill="#00C9A7" fillOpacity="0.15" stroke="#00C9A7" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"
        />
        <path d="M9.5 11.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5c0 2.5-2.5 4-2.5 4s-2.5-1.5-2.5-4z"
          fill="#F5B800" />
      </svg>
    </div>
    <div className="absolute top-8 right-8 w-9 h-9 rounded-full bg-[#F5B800] flex items-center justify-center shadow-sm">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
        <circle cx="10" cy="7" r="4" />
      </svg>
    </div>
    <div className="absolute bottom-10 left-8 w-8 h-8 rounded-full bg-[#00C9A7]/20 border-2 border-[#00C9A7]/40 flex items-center justify-center">
      <div className="w-2.5 h-2.5 rounded-full bg-[#00C9A7]" />
    </div>
  </div>
);

/* ── Slide data — store component refs, NOT pre-rendered JSX ─────────────── */

interface Slide {
  // Component reference so React renders fresh each time, avoiding removeChild errors
  Illustration: () => React.ReactElement;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    Illustration: FareIllustration,
    title: "Know the right fare before boarding.",
    body: "Check crowd-verified fare ranges for danfo and keke routes in real-time.",
  },
  {
    Illustration: RouteIllustration,
    title: "Discover trusted routes & nearby essentials.",
    body: "Verify routes from Ojota to CMS and more. Find the nearest bank, hospital, or market instantly.",
  },
  {
    Illustration: SafetyIllustration,
    title: "Share your trip with someone you trust.",
    body: "Keep your loved ones informed. Share live trip details with trusted contacts in real-time.",
  },
];

/* ── Page ────────────────────────────────────────────────────────────────── */

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const isLast = step === SLIDES.length - 1;

  const { Illustration, title, body } = SLIDES[step];

  return (
    <main className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Skip */}
      <div className="flex justify-end px-5 pt-12">
        <button
          type="button"
          onClick={() => navigate("/auth/role-select")}
          className="text-xs font-semibold tracking-widest uppercase text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Illustration — rendered from component ref, never a stale ReactNode */}
      <div className="flex-1 flex items-center justify-center px-6 py-6">
        <Illustration />
      </div>

      {/* Text + controls */}
      <div className="px-6 pb-12 flex flex-col items-center gap-6">
        <div className="flex flex-col gap-2 text-center max-w-xs">
          <h2 className="text-base font-bold text-gray-900 leading-snug">{title}</h2>
          <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
        </div>

        {/* Dots + step counter */}
        <div className="flex items-center justify-between w-full">
          <StepDots total={SLIDES.length} current={step} />
          <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">
            Step {step + 1} of {SLIDES.length}
          </span>
        </div>

        {/* Back / Next */}
        <div className="flex items-center justify-center gap-3 w-full">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1.5 px-6 py-3 rounded-full text-sm font-semibold text-gray-500 border border-gray-300 bg-white hover:border-gray-400 hover:text-gray-700 active:scale-[0.97] transition-all duration-150"
            >
              <span aria-hidden="true">←</span> Back
            </button>
          )}

          <PrimaryButton
            withArrow
            width={step === 0 ? "fixed" : "auto"}
            onClick={() => {
              if (isLast) navigate("/auth/role-select");
              else setStep(s => s + 1);
            }}
          >
            {isLast ? "Start Commuting" : "Next"}
          </PrimaryButton>
        </div>
      </div>
    </main>
  );
};

export default Onboarding;
