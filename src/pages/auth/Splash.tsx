import { AppLogo } from "../../components";

/**
 * Splash / launch screen.
 * Pure black background with centred logo and tagline.
 * Shown briefly on app open before navigating to RoleSelect or Home.
 */
const Splash = () => {
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center justify-center gap-6 px-8">
      <AppLogo size="lg" showWordmark />

      <p className="text-base font-bold text-white text-center tracking-wide">
        Know Your Route Before You Ride.
      </p>
    </main>
  );
};

export default Splash;
