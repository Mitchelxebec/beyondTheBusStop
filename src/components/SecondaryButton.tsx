import type { ButtonHTMLAttributes, ReactNode } from "react";

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  fullWidth?: boolean;
}

/**
 * Outlined secondary button — used for "Continue with Google",
 * "Register with Google", "Log in" text-alternatives, etc.
 * Light background, dark border.
 */
const SecondaryButton = ({
  children,
  fullWidth = true,
  className = "",
  ...rest
}: SecondaryButtonProps) => {
  return (
    <button
      type="button"
      className={`${
        fullWidth ? "w-full" : ""
      } bg-white text-gray-800 font-medium text-base rounded-full py-4 px-6 border border-gray-200 flex items-center justify-center gap-2 active:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
