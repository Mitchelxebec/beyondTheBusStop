import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Store,
  MapPin,
  Star,
  Clock,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getListingById } from "../services/listings";
import ListingReviewsSection from "./ListingReviewsSection";


interface ListingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string | null;
  userCoords?: { lat: number; lng: number };
  children?: React.ReactNode; // Slot for Step 6 Reviews & Ratings
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  isOpen,
  onClose,
  listingId,
  userCoords,
  children,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // ── Step 5: Live Query calls GET /api/listings/:listingId ─────────────────
  // Automatically triggers backend view tracking deduplication over 30 mins
  const {
    data: listingData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["listing-detail", listingId, userCoords?.lat, userCoords?.lng],
    queryFn: () => getListingById(listingId!, userCoords),
    enabled: Boolean(isOpen && listingId),
  });

  if (!isOpen || !listingId) return null;

  const listing = listingData?.listing;
  const photos = listing?.photoUrls || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-detail-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-black/10 animate-in slide-in-from-bottom-5 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-black/5 shrink-0 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#005047]/10 flex items-center justify-center text-[#005047] shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="listing-detail-title"
                className="text-base font-bold text-[#1C1B1B] m-0"
              >
                {listing?.businessName || "Vendor Details"}
              </h3>
              <p className="text-xs text-[#747878] m-0 mt-0.5">
                {listing?.category || "Corridor Merchant"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F1EE] flex items-center justify-center text-[#444748] hover:text-[#1C1B1B] hover:bg-[#EBE8E7] transition-colors cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#005047]" />
              <span className="text-xs">Loading vendor details...</span>
            </div>
          ) : isError ? (
            <div className="bg-[#FCE8E6] text-[#BA1A1A] text-xs font-semibold p-4 rounded-xl flex items-center gap-2 border border-[#BA1A1A]/20">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>
                {(error as any)?.response?.data?.message ||
                  "Unable to load vendor listing details."}
              </span>
            </div>
          ) : listing ? (
            <>
              {/* Photo Gallery */}
              {photos.length > 0 ? (
                <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden bg-neutral-100 group">
                  <img
                    src={photos[activePhotoIdx]}
                    alt={`${listing.businessName} photo ${activePhotoIdx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActivePhotoIdx((prev) =>
                            prev === 0 ? photos.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActivePhotoIdx((prev) =>
                            prev === photos.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40">
                        {photos.map((_, idx) => (
                          <span
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              activePhotoIdx === idx
                                ? "bg-white w-3"
                                : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-32 rounded-2xl bg-[#005047]/5 border border-[#005047]/10 flex flex-col items-center justify-center text-[#005047] gap-1.5">
                  <Store className="w-8 h-8 opacity-70" />
                  <span className="text-xs font-medium opacity-80">
                    Verified Corridor Merchant
                  </span>
                </div>
              )}

              {/* Description & Details */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1C1B1B]">
                    About this business
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#005047] bg-[#79F7E3]/30 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    Live Corridor Vendor
                  </span>
                </div>
                <p className="text-xs text-[#444748] leading-relaxed whitespace-pre-line m-0">
                  {listing.description}
                </p>
              </div>

              {/* Location Coordinates Badge */}
              {listing.location && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F4F1EE] text-[#444748] text-xs">
                  <MapPin className="w-4 h-4 text-[#005047] shrink-0" />
                  <span className="truncate">
                    GPS: {listing.location.lat.toFixed(4)},{" "}
                    {listing.location.lng.toFixed(4)}
                  </span>
                </div>
              )}

              {/* Step 6 Reviews & Ratings Component */}
              <ListingReviewsSection listingId={listing._id} />

              {children}
            </>
          ) : null}

        </div>
      </div>
    </div>
  );
};

export default ListingDetailModal;
