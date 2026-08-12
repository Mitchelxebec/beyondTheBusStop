import heroImg from "../assets/btbs.png";

interface AppLogoProps {
  /** Size of the logo container square. Defaults to "md". */
  size?: "xs" | "sm" | "md" | "lg";
  /** Show the wordmark text beneath the icon. Defaults to true. */
  showWordmark?: boolean;
  /** Force white wordmark text (for dark backgrounds). Defaults to false. */
  light?: boolean;
}

const sizeMap = {
  xs: "w-8 h-8",
  sm: "w-14 h-14",
  md: "w-20 h-20",
  lg: "w-28 h-28",
};

/**
 * App logo: rounded-square icon card + optional "Beyond the Bus Stop" wordmark.
 * Appears on: Splash, Onboarding, Commuter Home, Login, Register screens.
 */
const AppLogo = ({ size = "md", showWordmark = true, light = false }: AppLogoProps) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeMap[size]} bg-white rounded-2xl shadow-md flex items-center justify-center overflow-hidden`}
      >
        <img
          src={heroImg}
          alt="Beyond the Bus Stop logo"
          className="w-full h-full object-contain p-1"
        />
      </div>

      {showWordmark && (
        <p className={`text-sm font-medium text-center leading-tight ${light ? "text-white/90" : "text-gray-700"}`}>
          Beyond the Bus Stop
        </p>
      )}
    </div>
  );
};

export default AppLogo;
