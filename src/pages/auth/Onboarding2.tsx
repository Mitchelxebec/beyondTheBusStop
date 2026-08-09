import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../components";

const Onboarding2 = () => {
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
      </div>

      {/* Text + controls */}
      <div className="px-6 pb-12 flex flex-col items-center gap-6">
        <div className="flex flex-col gap-2 text-center max-w-xs">
          <h2 className="text-base font-bold text-gray-900 leading-snug">
            Discover trusted routes &amp; nearby essentials.
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Verify routes from Ojota to CMS and more. Find the nearest bank, hospital, or market instantly.
          </p>
        </div>

        {/* Dots + counter */}
        <div className="flex items-center justify-between w-full max-w-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="w-6 h-2 rounded-full bg-[#F5B800]" />
            <span className="w-2 h-2 rounded-full bg-gray-300" />
          </div>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">
            Step 2 of 3
          </span>
        </div>

        <div className="flex items-center justify-center gap-3 w-full max-w-xs">
          <button
            type="button"
            onClick={() => navigate("/onboarding/1")}
            className="flex items-center gap-1.5 px-6 py-3 rounded-full text-sm font-semibold text-gray-500 border border-gray-300 bg-white hover:border-gray-400 hover:text-gray-700 active:scale-[0.97] transition-all duration-150"
          >
            <span aria-hidden="true">←</span> Back
          </button>
          <PrimaryButton withArrow width="auto" onClick={() => navigate("/onboarding/3")}>
            Next
          </PrimaryButton>
        </div>
      </div>
    </main>
  );
};

export default Onboarding2;
