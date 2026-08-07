import type { ReactNode } from "react";

interface PageHeaderProps {
  /** Main title text shown on the left. */
  title: string;
  /** Optional node rendered on the right side (icon button, badge, etc.). */
  trailing?: ReactNode;
  /** Optional node rendered on the left before the title (e.g. a back button). */
  leading?: ReactNode;
}

/**
 * Top page header with title + optional leading/trailing slots.
 * Appears on: Home, Nearby Essentials, Share Trip, Route Details,
 *             Profile, Vendor Dashboard, Search Results.
 */
const PageHeader = ({ title, trailing, leading }: PageHeaderProps) => {
  return (
    <header className="flex items-center justify-between px-5 pt-12 pb-3">
      <div className="flex items-center gap-3">
        {leading}
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
      </div>
      {trailing && <div>{trailing}</div>}
    </header>
  );
};

export default PageHeader;
