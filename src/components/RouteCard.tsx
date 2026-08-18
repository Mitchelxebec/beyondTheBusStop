import { Bus, ArrowRight, Banknote, Clock } from "lucide-react";
import ConfidenceBadge from "./ConfidenceBadge";
import { getRoutePlaceName, type Route } from "../types/routes";

export interface RouteCardProps {
  route: Route;
  onSelect: (route: Route) => void;
  /** Variant of the card: "home" (single-line with left accent) or "search" (vertical From/To with View Details button). Default "home" */
  variant?: "home" | "search";
  /** Optional badge text shown alongside details (e.g. "Created by you") */
  badgeText?: string;
  /** Show 4px teal accent bar on left edge (Figma node 178:248). Default true (home variant only) */
  showAccentBar?: boolean;
  className?: string;
}

/**
 * Shared RouteCard component.
 * Supports two canonical designs:
 *  - "home": Figma Node 178:248 ("Commuter Home Dashboard") — white card, 4px teal left accent bar, single-line Origin → Destination, and circular gold bus button.
 *  - "search": Figma Search Results design — teal header with vertical From/To route line, fare & mode indicators, confidence badge, and gold "View Details" button.
 */
export const RouteCard = ({
  route,
  onSelect,
  variant = "home",
  badgeText,
  showAccentBar = true,
  className = "",
}: RouteCardProps) => {
  const originName = getRoutePlaceName(route.origin);
  const destName = getRoutePlaceName(route.destination);

  if (variant === "search") {
    return (
      <article
        onClick={() => onSelect(route)}
        className={`bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow border border-neutral-200/80 cursor-pointer ${className}`}
      >
        {/* From / To section (Teal Header in Search Figma, matching node 178:248/search wireframe) */}
        <div className="bg-[#009688] px-5 pt-5 pb-4 text-white">
          <div className="flex items-start gap-3.5">
            {/* Route line dots */}
            <div className="flex flex-col items-center pt-1 gap-1 shrink-0">
              <span className="w-3 h-3 rounded-full bg-[#1A1A1A] ring-2 ring-white/60 shadow-xs" />
              <span className="w-0.5 h-8 bg-white/40 rounded-full" />
              <span className="w-3 h-3 rounded-full bg-[#FFC72C] ring-2 ring-white/60 shadow-xs" />
            </div>

            <div className="flex flex-col gap-3 flex-1 min-w-0">
              <div>
                <p className="text-[10px] font-medium text-white/70 uppercase tracking-wide">From</p>
                <p className="text-sm sm:text-base font-bold text-white mt-0.5 truncate">{originName}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-white/70 uppercase tracking-wide">To</p>
                <p className="text-sm sm:text-base font-bold text-white mt-0.5 truncate">{destName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fare + Vehicle / Duration + Confidence + CTA */}
        <div className="px-5 py-4 flex items-center justify-between gap-3 bg-white">
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-[#444748]" />
              <span className="text-sm font-bold text-gray-900">
                ₦{route.fareLow.toLocaleString()} – ₦{route.fareHigh.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-700 capitalize px-2 py-0.5 rounded bg-gray-100 flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-500" />
                {route.vehicleType}
              </span>
              <ConfidenceBadge level={route.confidenceLevel} />
              {badgeText && (
                <span className="text-[10px] font-semibold text-[#005047] bg-[#79F7E3]/30 px-1.5 py-0.5 rounded">
                  {badgeText}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(route);
            }}
            className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold bg-[#FFC72C] hover:bg-[#F5B800] text-[#1A1A1A] shadow-xs hover:shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
          >
            View Details
          </button>
        </div>
      </article>
    );
  }

  // Home variant (default)
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
              {originName}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C4C7C7] shrink-0" aria-hidden="true" />
            <span className="text-[#1C1B1B] text-base leading-6 font-normal truncate">
              {destName}
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
          aria-label={`View route from ${originName} to ${destName}`}
          className="shrink-0 w-10 h-10 rounded-full bg-[#FFC72C] flex items-center justify-center transition-transform active:scale-95 hover:brightness-95 cursor-pointer text-[#6F5400]"
        >
          <Bus className="w-4 h-4 text-[#4A3B00]" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
};

export default RouteCard;
