import type { ReactNode } from "react";

interface SectionLabelProps {
  children: ReactNode;
  /** Optional trailing action node (e.g. "View All", "CLEAR ALL"). */
  action?: ReactNode;
  /**
   * Text style variant.
   * "default" — xs bold gray (original, used across all non-home pages).
   * "page"    — 16px normal #1C1B1B (Figma Home Dashboard spec).
   */
  variant?: "default" | "page";
}

const variantClass: Record<"default" | "page", string> = {
  default: "text-xs font-bold tracking-widest uppercase text-gray-500",
  page:    "text-base font-normal tracking-wide  uppercase text-[#1C1B1B]",
};

/**
 * All-caps section heading with optional right-side action link.
 * Appears on: Home ("QUICK ROUTES", "NEARBY ESSENTIALS", "RECENT SEARCHES"),
 *             Share Trip ("SHARE WITH", "VEHICLE DETAILS"),
 *             Routes ("Favorite Routes", "Recently Viewed").
 */
const SectionLabel = ({ children, action, variant = "default" }: SectionLabelProps) => {
  return (
    <div className="flex items-center justify-between px-1">
      <span className={variantClass[variant]}>
        {children}
      </span>
      {action && <div>{action}</div>}
    </div>
  );
};

export default SectionLabel;
