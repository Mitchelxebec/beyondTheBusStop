import type { ReactNode } from "react";

interface SectionLabelProps {
  children: ReactNode;
  /** Optional trailing action node (e.g. "View All", "CLEAR ALL"). */
  action?: ReactNode;
}

/**
 * Small all-caps section heading with optional right-side action link.
 * Appears on: Home ("QUICK ROUTES", "NEARBY ESSENTIALS", "RECENT SEARCHES"),
 *             Share Trip ("SHARE WITH", "VEHICLE DETAILS"),
 *             Routes ("Favorite Routes", "Recently Viewed").
 */
const SectionLabel = ({ children, action }: SectionLabelProps) => {
  return (
    <div className="flex items-center justify-between px-1">
      <span className="text-xs font-bold tracking-widest uppercase text-gray-500">
        {children}
      </span>
      {action && <div>{action}</div>}
    </div>
  );
};

export default SectionLabel;
