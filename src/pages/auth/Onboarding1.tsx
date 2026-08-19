import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../components";
import busesImg from "../../assets/buses.jpg";
import kekesImg from "../../assets/kekes.jpg";

const Onboarding1 = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">

      {/* ── Full-bleed background photo (buses street scene) ────────────────
          Covers the whole screen at low opacity so the bottom panel and
          illustration all sit on top of it naturally.                     */}
      <img
        src={busesImg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        style={{ opacity: 0.12 }}
        draggable={false}
      />

      {/* Warm tint layer — lets more of the photo show through */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ background: "rgba(245,245,240,0.62)" }}
      />

      {/* Skip — exactly as before, now relative so it sits above layers */}
      <div className="relative flex justify-end px-5 pt-12">
        <button
          type="button"
          onClick={() => navigate("/auth/role-select")}
          className="text-xs font-semibold tracking-widest uppercase text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Illustration — same layout and badges, gray circle replaced with keke photo */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center px-6 py-4">
        <div className="relative flex items-center justify-center w-52 h-52">

          {/* Keke photo circle — replaces the plain gray circle backdrop */}
          <div className="absolute w-40 h-40 rounded-full overflow-hidden shadow-md">
            <img
              src={kekesImg}
              alt="Keke napep on a Lagos road"
              className="w-full h-full object-cover object-center"
              draggable={false}
            />
            {/* Overlay to keep it from fighting the badges — matches the warm tint */}
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: "rgba(245,245,240,0.35)" }}
              aria-hidden="true"
            />
          </div>

          {/* Fare tag — unchanged */}
          <div className="relative z-10 bg-white rounded-2xl border-2 border-[#F5B800] px-5 py-4 shadow-md flex gap-2 items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5B800]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5B800]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5B800]" />
          </div>

          {/* Fare amount badge — unchanged */}
          <div className="absolute bottom-10 left-4 bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
            ₦150 – ₦200
          </div>

          {/* Verified check badge — unchanged */}
          <div className="absolute top-8 right-6 w-8 h-8 rounded-xl bg-[#E8FAF5] border border-[#00C9A7]/30 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="2.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Text + controls — exactly as before */}
      <div className="relative px-6 pb-12 flex flex-col items-center gap-6">
        <div className="flex flex-col gap-2 text-center max-w-xs">
          <h2 className="text-base font-bold text-gray-900 leading-snug">
            Know the right fare before boarding.
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Check crowd-verified fare ranges for danfo and keke routes in real-time.
          </p>
        </div>

        {/* Dots + counter — unchanged */}
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
