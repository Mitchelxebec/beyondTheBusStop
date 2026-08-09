import type { ButtonHTMLAttributes, ReactNode } from "react";

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  width?: "auto" | "fixed" | "full";
}

const widthClass = {
  auto:  "w-auto",
  fixed: "w-full max-w-xs",
  full:  "w-full",
};

const SecondaryButton = ({
  children,
  width = "fixed",
  className = "",
  ...rest
}: SecondaryButtonProps) => {
  return (
    <button
      type="button"
      className={`
        ${widthClass[width]}
        bg-white text-gray-800 font-medium text-sm
        rounded-full py-3 px-8
        border border-gray-200
        flex items-center justify-center gap-2
        hover:bg-gray-50 active:scale-[0.97]
        transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
