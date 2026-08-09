import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../components";

const Onboarding3 = () => {
  const navigate = useNavigate();

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

      {/* Illustration */}
      <div className="flex-1 flex items-center justify-center px-6 py-6">
        <div className="relative flex items-center justify-center w-52 h-52">
          <div className="absolute w-44 h-44 rounded-full bg-[#00C9A7]/10 border border-[#00C9A7]/20" />
          <div className="relative z-10 w-20 h-20 flex items-center justify-center">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11 4.5-.85 8-5.75 8-11V6l-8-4z"
                fill="#00C9A7" fillOpacity="0.15" stroke="#00C9A7" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
              />
              <path
                d="M9.5 11.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5c0 2.5-2.5 4-2.5 4s-2.5-1.5-2.5-4z"
                fill="#F5B800"
              />
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
      </div>

      {/* Text + controls */}
      <div className="px-6 pb-12 flex flex-col items-center gap-6">
        <div className="flex flex-col gap-2 text-center max-w-xs">
          <h2 className="text-base font-bold text-gray-900 leading-snug">
            Share your trip with someone you trust.
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Keep your loved ones informed. Share live trip details with trusted contacts in real-time.
          </p>
        </div>

        {/* Dots + counter */}
        <div className="flex items-center justify-between w-full max-w-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="w-6 h-2 rounded-full bg-[#F5B800]" />
          </div>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">
            Step 3 of 3
          </span>
        </div>

        <div className="flex items-center justify-center gap-3 w-full max-w-xs">
          <button
            type="button"
            onClick={() => navigate("/onboarding/2")}
            className="flex items-center gap-1.5 px-6 py-3 rounded-full text-sm font-semibold text-gray-500 border border-gray-300 bg-white hover:border-gray-400 hover:text-gray-700 active:scale-[0.97] transition-all duration-150"
          >
            <span aria-hidden="true">←</span> Back
          </button>
          <PrimaryButton withArrow width="auto" onClick={() => navigate("/auth/role-select")}>
            Start Commuting
          </PrimaryButton>
        </div>
      </div>
    </main>
  );
};

export default Onboarding3;
