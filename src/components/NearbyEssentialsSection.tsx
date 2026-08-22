import React, { useState } from "react";
import {
  Shield,
  Hospital,
  MapPin,
  Store as VendorIcon,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import type { NearbyPlace } from "../services/locations";
import ListingDetailModal from "./ListingDetailModal";


export type EssentialsCategoryFilter =
  | "all"
  | "hospital"
  | "police"
  | "vendor";

// ── Category Icon Mapper ───────────────────────────────────────────────────────
const PLACE_CATEGORY_ICON: Record<string, React.ReactNode> = {
  hospital: <Hospital className="w-4 h-4 text-[#BA1A1A]" />,
  police: <Shield className="w-4 h-4 text-[#005047]" />,
  vendor: <VendorIcon className="w-4 h-4 text-[#005047]" />,
};

const PLACE_CATEGORY_BG: Record<string, string> = {
  hospital: "bg-[#FCE8E6]",
  police: "bg-[#E6FAF6]",
  vendor: "bg-[#79F7E3]/25",
};

interface NearbyEssentialsSectionProps {
  places: NearbyPlace[];
  isLoading?: boolean;
  destName?: string;
  maxItems?: number;
  initialFilter?: EssentialsCategoryFilter;
  onViewAll?: (activeFilter: EssentialsCategoryFilter) => void;
  showHeader?: boolean;
}

export const NearbyEssentialsSection: React.FC<NearbyEssentialsSectionProps> = ({
  places,
  isLoading = false,
  destName = "",
  maxItems,
  initialFilter = "all",
  onViewAll,
  showHeader = true,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] =
    useState<EssentialsCategoryFilter>(initialFilter);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null
  );

  const filteredEssentials = places.filter((item) => {
    if (activeCategoryFilter === "all") return true;
    return item.category === activeCategoryFilter;
  });

  const displayedEssentials = maxItems
    ? filteredEssentials.slice(0, maxItems)
    : filteredEssentials;

  const hasMoreItems =
    Boolean(maxItems) && filteredEssentials.length > (maxItems ?? 0);

  return (
    <section
      aria-labelledby="nearby-essentials-heading"
      className="flex flex-col gap-3 pt-1"
    >
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#59DBC7]">
              Safety & Surroundings
            </span>
            <h2
              id="nearby-essentials-heading"
              className="text-base sm:text-lg font-bold text-[#1C1B1B] m-0"
            >
              Nearby Essentials Along Route
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F4F1EE] text-[#444748]">
            {filteredEssentials.length} Found
          </span>
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: "all", label: "All Essentials" },
          { id: "hospital", label: "Hospitals", icon: Hospital },
          { id: "police", label: "Police Stations", icon: Shield },
          { id: "vendor", label: "Listed Vendors", icon: VendorIcon },
        ].map((tab) => {
          const isActive = activeCategoryFilter === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveCategoryFilter(tab.id as EssentialsCategoryFilter)
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                isActive
                  ? "bg-[#005047] text-white shadow-xs"
                  : "bg-white text-[#444748] border border-neutral-200 hover:border-neutral-400"
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Essentials Grid / Cards */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-6 text-center text-xs text-[#747878] border border-neutral-100">
          Finding hospitals, police stations, and essentials near {destName || "destination"}…
        </div>
      ) : filteredEssentials.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center text-xs text-[#747878] border border-neutral-100">
          No nearby locations found for this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayedEssentials.map((place) => {
            const cat = place.category || "vendor";
            const icon =
              PLACE_CATEGORY_ICON[cat] || (
                <MapPin className="w-4 h-4 text-[#747878]" />
              );
            const bg = PLACE_CATEGORY_BG[cat] || "bg-neutral-100";
            const isVendor = cat === "vendor";

            return (
              <article
                key={place.placeId}
                onClick={() => {
                  if (isVendor) {
                    setSelectedListingId(place.placeId);
                  }
                }}
                className={`bg-white rounded-xl p-3.5 border border-neutral-100 shadow-xs flex items-start gap-3 transition-all ${
                  isVendor
                    ? "hover:border-[#005047]/40 hover:shadow-sm cursor-pointer"
                    : "hover:border-neutral-300"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0 overflow-hidden border border-black/5`}
                >
                  {isVendor && (place.imageUrl || place.profilePicture) ? (
                    <img
                      src={place.imageUrl || place.profilePicture || ""}
                      alt={place.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    icon
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-[#1C1B1B] truncate">
                      {place.name}
                    </span>
                    {isVendor && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#79F7E3]/30 text-[#005047] shrink-0">
                        Vendor
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-[#747878] truncate">
                    {place.address}
                  </span>

                  <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-[#444748]">
                    <span className="font-bold text-[#005047]">
                      {place.distance} {place.distanceUnit || "km"} away
                    </span>
                    {place.rating && <span>• ⭐ {place.rating}</span>}
                    {place.openNow !== undefined &&
                      place.openNow !== null && (
                        <span
                          className={
                            place.openNow
                              ? "text-[#007A62] font-semibold"
                              : "text-[#BA1A1A]"
                          }
                        >
                          • {place.openNow ? "Open Now" : "Closed"}
                        </span>
                      )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* View All Button when capped */}
      {hasMoreItems && onViewAll && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            id="view-all-essentials-btn"
            onClick={() => onViewAll(activeCategoryFilter)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-[#005047] text-[#005047] bg-white hover:bg-[#005047]/5 active:scale-95 transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <span>View All {filteredEssentials.length} Essentials</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Live Listing Detail & View Tracking Modal */}
      <ListingDetailModal
        isOpen={Boolean(selectedListingId)}
        onClose={() => setSelectedListingId(null)}
        listingId={selectedListingId}
      />
    </section>
  );
};

export default NearbyEssentialsSection;

