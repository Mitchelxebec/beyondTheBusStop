import { useNavigate } from "react-router-dom";
import { AppLogo, PrimaryButton } from "../../components";
import busesImg from "../../assets/buses.jpg";

const Splash = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center px-6 pb-12 relative overflow-hidden">

      {/* Full-bleed background photo — heavily darkened so existing content reads */}
      <img
        src={busesImg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ opacity: 0.18 }}
        draggable={false}
      />

      {/* Dark vignette over the photo so edges feel deep */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(10,10,10,0.75) 100%)",
        }}
      />

      {/* Existing subtle radial glow — unchanged */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div className="w-64 h-64 rounded-full bg-[#F5B800]/5 blur-3xl" />
      </div>

      {/* Existing content — untouched */}
      <div className="relative flex flex-col items-center gap-5 flex-1 justify-center">
        <AppLogo size="lg" showWordmark light />
        <p className="text-sm font-semibold text-white/90 text-center tracking-widest uppercase">
          Know Your Route Before You Ride
        </p>
      </div>

      <div className="relative">
        <PrimaryButton withArrow onClick={() => navigate("/onboarding")}>
          Get Started
        </PrimaryButton>
      </div>
    </main>
  );
};

export default Splash;
