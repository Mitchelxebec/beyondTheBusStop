import type { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Show the → arrow suffix. Defaults to false. */
  withArrow?: boolean;
  /** Full-width block button. Defaults to true. */
  fullWidth?: boolean;
}

/**
 * Large amber/yellow CTA button used across nearly every screen.
 * Examples: "Next →", "Start Commuting →", "Get Started →",
 *           "Log In →", "Create Account", "Share Now", etc.
 */
const PrimaryButton = ({
  children,
  withArrow = false,
  fullWidth = true,
  className = "",
  ...rest
}: PrimaryButtonProps) => {
  return (
    <button
      type="button"
      className={`${
        fullWidth ? "w-full" : ""
      } bg-[#F5B800] text-[#1A1A1A] font-semibold text-base rounded-full py-4 px-6 flex items-center justify-center gap-2 active:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {children}
      {withArrow && <span aria-hidden="true">→</span>}
    </button>
  );
};

export default PrimaryButton;
