import { useState, useRef, useEffect } from "react";
import { Camera, X, AlertCircle, Loader2, Building2, Tag } from "lucide-react";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import LocationPickerMap from "./LocationPickerMap";
import { updateListing, type MyListing } from "../services/listings";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FormErrors {
  location?: string;
  description?: string;
}

interface PhotoPreview {
  file: File;
  previewUrl: string;
}

export interface EditListingModalProps {
  listing: MyListing;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * EditListingModal
 *
 * Displays Business Name and Category as read-only profile properties.
 * Allows editing Description, Location (via draggable map), and Photos.
 * Submits updates to PUT /api/listings/:listingId via updateListing().
 */
const EditListingModal = ({
  listing,
  isOpen,
  onClose,
  onSuccess,
}: EditListingModalProps) => {
  // ── Form State (Pre-filled with listing data) ──────────────────────────────
  const [description, setDescription] = useState(listing.description);
  const [location, setLocation] = useState<{ lat: number; lng: number }>({
    lat: listing.location.lat,
    lng: listing.location.lng,
  });
  const [existingPhotos, setExistingPhotos] = useState<string[]>(
    listing.photoUrls ?? []
  );
  const [newPhotos, setNewPhotos] = useState<PhotoPreview[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever the target listing changes
  useEffect(() => {
    setDescription(listing.description);
    setLocation({
      lat: listing.location.lat,
      lng: listing.location.lng,
    });
    setExistingPhotos(listing.photoUrls ?? []);
    setNewPhotos([]);
    setErrors({});
    setSubmitError(null);
  }, [listing]);

  if (!isOpen) return null;

  // ── Location Handler ────────────────────────────────────────────────────────
  const handleLocationChange = (coords: { lat: number; lng: number }) => {
    setLocation(coords);
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: undefined }));
    }
  };

  // ── Photo Handling ──────────────────────────────────────────────────────────
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const availableSlots = 5 - (existingPhotos.length + newPhotos.length);
    if (availableSlots <= 0) return;

    const newPreviews: PhotoPreview[] = files.slice(0, availableSlots).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setNewPhotos((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!location || location.lat === undefined || location.lng === undefined) {
      newErrors.location = "Please set your business location on the map.";
    }
    if (!description.trim() || description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Calls PUT /api/listings/:listingId (listing.routes.js:51-56, listing.controller.js:452-575)
      // Auth: protect + requireActiveSubscription
      await updateListing(listing._id, {
        description: description.trim(),
        location: {
          lat: location.lat,
          lng: location.lng,
        },
        photoUrls: existingPhotos,
      });

      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong updating the listing. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPhotosCount = existingPhotos.length + newPhotos.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-listing-modal-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#F5F5F0] rounded-3xl max-w-lg w-full max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-black/10 animate-in fade-in zoom-in-95 duration-150 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-white border-b border-black/5 shrink-0">
          <div className="flex flex-col min-w-0">
            <h2
              id="edit-listing-modal-title"
              className="text-base sm:text-lg font-bold text-[#1C1B1B] m-0 leading-tight"
            >
              Edit Listing
            </h2>
            <p className="text-[11px] text-[#747878] m-0 mt-0.5 truncate">
              Update details for {listing.businessName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit modal"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center text-gray-600 transition-all ml-2 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable Form Body ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
          <form
            id="edit-listing-form"
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5"
          >
            {/* Global submit error */}
            {submitError && (
              <div
                role="alert"
                className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
              >
                <AlertCircle
                  className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-sm text-red-700 m-0">{submitError}</p>
              </div>
            )}

            {/* ── Read-Only Business Profile Info ─────────────────────────── */}
            <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#747878]">
                  Business Profile Details
                </span>
                <span className="text-[10px] text-[#A4A7A7] font-medium">
                  Read-only
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                {/* Business Name */}
                <div className="flex items-start gap-2.5 bg-[#F5F5F0] rounded-xl p-3">
                  <Building2 className="w-4 h-4 text-[#747878] shrink-0 mt-0.5" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-medium text-[#747878]">
                      Business Name
                    </span>
                    <span className="text-sm font-bold text-[#1C1B1B] truncate">
                      {listing.businessName}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-start gap-2.5 bg-[#F5F5F0] rounded-xl p-3">
                  <Tag className="w-4 h-4 text-[#005047] shrink-0 mt-0.5" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-medium text-[#747878]">
                      Category
                    </span>
                    <span className="text-sm font-semibold text-[#005047] truncate">
                      {listing.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Map Picker (Pre-centered on listing's initialCoords) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 px-1">
                Business Location
              </label>
              <LocationPickerMap
                onLocationChange={handleLocationChange}
                initialCoords={{
                  lat: listing.location.lat,
                  lng: listing.location.lng,
                }}
              />
              {errors.location && (
                <p className="text-xs text-red-500 px-1">{errors.location}</p>
              )}
              {location && (
                <p className="text-[11px] text-[#747878] px-1">
                  Pin set at {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-business-description"
                className="text-sm font-medium text-gray-700 px-1"
              >
                Business Description
              </label>
              <textarea
                id="edit-business-description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) {
                    setErrors((prev) => ({ ...prev, description: undefined }));
                  }
                }}
                placeholder="Describe what your business offers to commuters nearby…"
                rows={4}
                className={`w-full bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 border outline-none resize-none transition-colors ${
                  errors.description
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-gray-400"
                }`}
              />
              <div className="flex items-center justify-between px-1">
                {errors.description ? (
                  <p className="text-xs text-red-500">{errors.description}</p>
                ) : (
                  <span />
                )}
                <span
                  className={`text-[11px] ${
                    description.length < 20 && description.length > 0
                      ? "text-red-400"
                      : "text-[#747878]"
                  }`}
                >
                  {description.length} / 20 min
                </span>
              </div>
            </div>

            {/* Photos (Pre-filled existing URLs + new additions) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-sm font-medium text-gray-700">
                  Photos
                  <span className="ml-1 text-xs font-normal text-[#747878]">
                    ({totalPhotosCount}/5)
                  </span>
                </label>
              </div>

              {/* Photos Grid */}
              {totalPhotosCount > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {/* Existing Photos from server */}
                  {existingPhotos.map((url, idx) => (
                    <div
                      key={`existing-${url}-${idx}`}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-black/10 shadow-xs group"
                    >
                      <img
                        src={url}
                        alt={`Existing Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingPhoto(idx)}
                        aria-label={`Remove photo ${idx + 1}`}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </div>
                  ))}

                  {/* Newly selected local preview photos */}
                  {newPhotos.map((photo, idx) => (
                    <div
                      key={photo.previewUrl}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-black/10 shadow-xs group"
                    >
                      <img
                        src={photo.previewUrl}
                        alt={`New Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewPhoto(idx)}
                        aria-label={`Remove new photo ${idx + 1}`}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </div>
                  ))}

                  {/* Add more slot if < 5 */}
                  {totalPhotosCount < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#F5B800] flex items-center justify-center text-gray-400 hover:text-[#F5B800] transition-colors"
                      aria-label="Add more photos"
                    >
                      <Camera className="w-5 h-5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}

              {/* Empty state photo dropzone if 0 photos */}
              {totalPhotosCount === 0 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-6 flex flex-col items-center justify-center gap-1.5 hover:border-[#F5B800] hover:bg-yellow-50/30 transition-colors group"
                  aria-label="Upload photos"
                >
                  <div className="w-9 h-9 rounded-full bg-gray-100 group-hover:bg-yellow-100 flex items-center justify-center transition-colors">
                    <Camera
                      className="w-4 h-4 text-gray-400 group-hover:text-[#F5B800] transition-colors"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-600 m-0">
                    Tap to add photos (Up to 5)
                  </p>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                aria-hidden="true"
                onChange={handlePhotoSelect}
              />
            </div>
          </form>
        </div>

        {/* ── Modal Footer ─────────────────────────────────────────────────── */}
        <div className="px-5 sm:px-6 py-4 bg-white border-t border-black/5 flex items-center justify-end gap-3 shrink-0">
          <SecondaryButton
            type="button"
            width="auto"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-semibold"
          >
            Cancel
          </SecondaryButton>

          <PrimaryButton
            type="submit"
            form="edit-listing-form"
            width="auto"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                Saving…
              </span>
            ) : (
              "Save Changes"
            )}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default EditListingModal;

