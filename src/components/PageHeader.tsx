import type { ReactNode } from "react";

interface PageHeaderProps {
  /** Main title text shown on the left. */
  title: string;
  /** Optional node rendered on the right side (icon button, badge, etc.). */
  trailing?: ReactNode;
  /** Optional node rendered on the left before the title (e.g. a back button). */
  leading?: ReactNode;
  /** Additional custom class names for outer header. */
  className?: string;
}

/**
 * Top page header with title + optional leading/trailing slots.
 * Appears on: Home, Nearby Essentials, Share Trip, Route Details,
 *             Profile, Vendor Dashboard, Search Results.
 */
const PageHeader = ({ title, trailing, leading, className = "" }: PageHeaderProps) => {
  return (
    <header className={`w-full px-5 pt-4 pb-3 ${className}`}>
      <div className="max-w-md sm:max-w-lg lg:max-w-xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {leading}
          <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        </div>
        {trailing && <div>{trailing}</div>}
      </div>
    </header>
  );
};

export default PageHeader;
