import { Bus, ArrowRight } from "lucide-react";
import ConfidenceBadge from "./ConfidenceBadge";
import type { Route } from "../types/routes";

interface RouteCardProps {
  route: Route;
  onSelect: (route: Route) => void;
  /** Optional badge text shown alongside details (e.g. "Created by you") */
  badgeText?: string;
  /** Show 4px teal accent bar on left edge (Figma node 178:248). Default true */
  showAccentBar?: boolean;
  className?: string;
}

/**
 * Shared RouteCard component.
 * Canonical design matching Figma Node 178:248 ("Commuter Home Dashboard").
 * Uses lucide-react icons (Bus, ArrowRight).
 */
export const RouteCard = ({
  route,
  onSelect,
  badgeText,
  showAccentBar = true,
  className = "",
}: RouteCardProps) => {
  return (
    <article
      onClick={() => onSelect(route)}
      className={`relative flex items-center bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-shadow cursor-pointer border border-neutral-100/80 ${className}`}
    >
      {/* 4px teal left accent bar (Figma) */}
      {showAccentBar && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 bg-[#79F7E3] rounded-l-xl"
          aria-hidden="true"
        />
      )}

      <div className="flex items-center justify-between w-full pl-5 pr-3 py-3.5 gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          {/* Origin → Destination */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#1C1B1B] text-base leading-6 font-normal truncate">
              {route.origin}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C4C7C7] shrink-0" aria-hidden="true" />
            <span className="text-[#1C1B1B] text-base leading-6 font-normal truncate">
              {route.destination}
            </span>
          </div>

          {/* Confidence + vehicle type + fare range + optional extra badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <ConfidenceBadge level={route.confidenceLevel} />
            <span className="text-[#444748] text-sm leading-5 capitalize">
              {route.vehicleType}
            </span>
            <span className="text-[#444748] text-sm leading-5 font-medium">
              ₦{route.fareLow.toLocaleString()} – ₦{route.fareHigh.toLocaleString()}
            </span>
            {badgeText && (
              <span className="text-[10px] font-semibold text-[#005047] bg-[#79F7E3]/30 px-1.5 py-0.5 rounded">
                {badgeText}
              </span>
            )}
          </div>
        </div>

        {/* Circular Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(route);
          }}
          aria-label={`View route from ${route.origin} to ${route.destination}`}
          className="shrink-0 w-10 h-10 rounded-full bg-[#FFC72C] flex items-center justify-center transition-transform active:scale-95 hover:brightness-95 cursor-pointer text-[#6F5400]"
        >
          <Bus className="w-4 h-4 text-[#4A3B00]" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
};

export default RouteCard;
