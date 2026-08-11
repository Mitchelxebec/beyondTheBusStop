import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../components";

/* Animated sparkle dots */
const Sparkle = ({ className }: { className: string }) => (
  <span className={`absolute text-[#F5B800] text-lg select-none pointer-events-none ${className}`} aria-hidden="true">
    ✦
  </span>
);

const ResetSuccess = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-xs flex flex-col items-center gap-7 text-center">

        {/* Icon with sparkles */}
        <div className="relative flex items-center justify-center w-20 h-20">
          <Sparkle className="top-0 right-2 animate-bounce" />
          <Sparkle className="bottom-1 left-1 animate-pulse text-sm" />

          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-[#00C9A7]/20 animate-ping" />

          {/* Badge */}
          <div className="w-16 h-16 rounded-full bg-[#00C9A7] flex items-center justify-center shadow-[0_4px_20px_rgba(0,201,167,0.35)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-gray-900">Password Reset Successful</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your password has been updated. You can now log in with your new credentials.
          </p>
        </div>

        {/* CTA */}
        <PrimaryButton withArrow width="full" onClick={() => navigate("/auth/role-select")}>
          Back to Login
        </PrimaryButton>

      </div>
    </main>
  );
};

export default ResetSuccess;
