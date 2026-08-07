import type { ButtonHTMLAttributes } from "react";

interface BackButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Show label text next to the chevron. Defaults to no label. */
  label?: string;
  /** Dark theme variant (white icon). Defaults to light theme (dark icon). */
  dark?: boolean;
}

/**
 * Back navigation button with left chevron icon and optional label.
 * Appears on: OTP Confirmation, Route Details, Search Results.
 */
const BackButton = ({
  label,
  dark = false,
  className = "",
  ...rest
}: BackButtonProps) => {
  const iconColor = dark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900";

  return (
    <button
      type="button"
      aria-label={label || "Go back"}
      className={`flex items-center gap-2 transition-colors ${iconColor} ${className}`}
      {...rest}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {label && <span className="text-base font-medium">{label}</span>}
    </button>
  );
};

export default BackButton;
