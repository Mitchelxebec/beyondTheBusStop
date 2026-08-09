import { useNavigate } from "react-router-dom";
import { AppLogo, PrimaryButton } from "../../components";

const Splash = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center px-6 pb-12">
      {/* Subtle radial glow behind logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-[#F5B800]/5 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-5 flex-1 justify-center">
        <AppLogo size="lg" showWordmark light />
        <p className="text-sm font-semibold text-white/90 text-center tracking-widest uppercase">
          Know Your Route Before You Ride
        </p>
      </div>

      <PrimaryButton withArrow onClick={() => navigate("/onboarding")}>
        Get Started
      </PrimaryButton>
    </main>
  );
};

export default Splash;
