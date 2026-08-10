import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../components";

const Onboarding1 = () => {
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
      <div className="flex-1 min-h-0 flex items-center justify-center px-6 py-4">
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
      </div>

      {/* Text + controls */}
      <div className="px-6 pb-12 flex flex-col items-center gap-6">
        <div className="flex flex-col gap-2 text-center max-w-xs">
          <h2 className="text-base font-bold text-gray-900 leading-snug">
            Know the right fare before boarding.
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Check crowd-verified fare ranges for danfo and keke routes in real-time.
          </p>
        </div>

        {/* Dots + counter */}
        <div className="flex items-center justify-between w-full max-w-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-2 rounded-full bg-[#F5B800]" />
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="w-2 h-2 rounded-full bg-gray-300" />
          </div>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">
            Step 1 of 3
          </span>
        </div>

        <PrimaryButton withArrow width="fixed" onClick={() => navigate("/onboarding/2")}>
          Next
        </PrimaryButton>
      </div>
    </main>
  );
};

export default Onboarding1;
