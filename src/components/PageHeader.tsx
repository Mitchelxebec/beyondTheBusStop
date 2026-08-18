import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  trailing?: ReactNode;
  leading?: ReactNode;
  className?: string;
}

/**
 * Page sub-header with three slots:
 *   leading (left) | title (centred) | trailing (right)
 *
 * Title is absolutely centred between the two side slots so it always
 * reads as the page name regardless of icon widths.
 */
const PageHeader = ({ title, trailing, leading, className = "" }: PageHeaderProps) => {
  return (
    <header className={`w-full px-4 sm:px-6 py-3 ${className}`}>
      <div className="relative flex items-center justify-between">
        {/* Left slot — back button or any leading element */}
        <div className="flex items-center z-10">
          {leading ?? <div className="w-9" />}
        </div>

        {/* Title — absolutely centred regardless of side slot widths */}
        <h1 className="absolute inset-x-0 text-center text-base font-semibold text-[#1C1B1B] pointer-events-none select-none">
          {title}
        </h1>

        {/* Right slot — bell, share button, etc. */}
        <div className="flex items-center z-10">
          {trailing ?? <div className="w-9" />}
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
