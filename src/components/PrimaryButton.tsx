import type { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Show the → arrow suffix. Defaults to false. */
  withArrow?: boolean;
  /**
   * Width behaviour.
   * "auto"  — shrinks to content (use for inline / icon buttons)
   * "fixed" — max-w-xs, centred (default — good for CTAs on any screen size)
   * "full"  — stretches to fill its container
   */
  width?: "auto" | "fixed" | "full";
}

const widthClass = {
  auto:  "w-auto",
  fixed: "w-full max-w-xs",
  full:  "w-full",
};

const PrimaryButton = ({
  children,
  withArrow = false,
  width = "fixed",
  className = "",
  ...rest
}: PrimaryButtonProps) => {
  return (
    <button
      type="button"
      className={`
        ${widthClass[width]}
        bg-[#F5B800] text-[#1A1A1A] font-semibold text-sm
        rounded-full py-3 px-8
        flex items-center justify-center gap-2
        shadow-[0_2px_12px_rgba(245,184,0,0.35)]
        hover:bg-[#FFCA28] active:scale-[0.97] active:shadow-none
        transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
        ${className}
      `}
      {...rest}
    >
      {children}
      {withArrow && (
        <span aria-hidden="true" className="text-base leading-none">→</span>
      )}
    </button>
  );
};

export default PrimaryButton;
