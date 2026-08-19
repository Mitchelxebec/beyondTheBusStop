import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  trailing?: ReactNode;
  leading?: ReactNode;
  className?: string;
}

/**
 * Page sub-header — three-slot layout:
 *   [leading]   [   title   ]   [trailing]
 *
 * Title is absolutely centred across the full width.
 * Leading/trailing slots are positioned above it (z-10 + relative)
 * so buttons are always clickable and never hidden behind the title.
 */
const PageHeader = ({ title, trailing, leading, className = "" }: PageHeaderProps) => {
  return (
    <header className={`w-full px-4 sm:px-6 py-3 ${className}`}>
      <div className="relative flex items-center justify-between h-9">

        {/* Left slot — must be relative + z-10 to sit above the absolute title */}
        <div className="relative z-10 flex items-center">
          {leading ?? <div className="w-9" />}
        </div>

        {/* Title — centred absolutely, pointer-events-none so it never blocks clicks */}
        <h1 className="absolute inset-x-0 inset-y-0 flex items-center justify-center text-base font-semibold text-[#1C1B1B] pointer-events-none select-none m-0">
          {title}
        </h1>

        {/* Right slot */}
        <div className="relative z-10 flex items-center">
          {trailing ?? <div className="w-9" />}
        </div>

      </div>
    </header>
  );
};

export default PageHeader;
