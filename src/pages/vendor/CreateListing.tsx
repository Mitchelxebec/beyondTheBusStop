import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, X, AlertCircle, Loader2, Building2, Tag } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import PrimaryButton from "../../components/PrimaryButton";
import Toast from "../../components/Toast";
import LocationPickerMap from "../../components/LocationPickerMap";
import { createListing, uploadListingPhotos } from "../../services/listings";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FormErrors {
  location?: string;
  description?: string;
}

interface PhotoPreview {
  file: File;
  previewUrl: string;
}

// Default Lagos Island coords — used only to detect if user moved the pin
const DEFAULT_LAT = 6.455;
const DEFAULT_LNG = 3.3841;

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * CreateListing — Vendor page to submit a new business listing.
 *
 * Route: /vendor/create-listing  (protected, role: "business")
 * Dev alias: /dev/create-listing
 *
 * Matches Figma node 354-1981 (Step 1 of 1: Basic Info).
 *
 * Fields:
 *  - Business Name & Category: Read-only display properties from vendor business profile
 *  - Location via draggable Leaflet map (required — user must move pin)
 *  - Business Description (required, min 20 chars)
 *  - Upload Photos (up to 5 images uploaded to Cloudinary via POST /api/listings/upload)
 *
 * Submit:
 *  - Uploads photos to POST /api/listings/upload to obtain Cloudinary URLs
 *  - Fires POST /api/listings with JSON body including hosted photoUrls
 *  - On success: toast → navigate to /vendor/home
 *  - On failure: inline error, form data preserved
 */
const CreateListing = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  // Read-only business profile info from session
  const displayBusinessName =
    session?.user?.businessName || session?.user?.fullName || "Your Business";
  const displayCategory = session?.user?.category || "Services & Logistics";

  // ── Form state ──────────────────────────────────────────────────────────────
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationMoved, setLocationMoved] = useState(false);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Location handler ────────────────────────────────────────────────────────
  const handleLocationChange = (coords: { lat: number; lng: number }) => {
    setLocation(coords);
    // Mark as moved only if the user actually changed it from the initial default
    const movedLat = Math.abs(coords.lat - DEFAULT_LAT) > 0.0001;
    const movedLng = Math.abs(coords.lng - DEFAULT_LNG) > 0.0001;
    if (movedLat || movedLng) {
      setLocationMoved(true);
    }
    // Clear location error once they interact
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: undefined }));
    }
  };

  // ── Photo handling ──────────────────────────────────────────────────────────
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const newPreviews: PhotoPreview[] = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...newPreviews].slice(0, 5)); // cap at 5
    // Reset file input so same file can be re-selected if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].previewUrl); // free memory
      copy.splice(index, 1);
      return copy;
    });
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!locationMoved) {
      newErrors.location = "Please adjust the pin to mark your business location.";
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
      let uploadedPhotoUrls: string[] = [];

      // 1. Upload photos to Cloudinary if user selected any
      if (photos.length > 0) {
        const filesToUpload = photos.map((p) => p.file);
        uploadedPhotoUrls = await uploadListingPhotos(filesToUpload);

        if (!uploadedPhotoUrls || uploadedPhotoUrls.length === 0) {
          throw new Error("Failed to upload photos. Please check your connection and try again.");
        }
      }

      // 2. Submit listing with real hosted Cloudinary URLs
      await createListing({
        description: description.trim(),
        location: {
          lat: location!.lat,
          lng: location!.lng,
        },
        photoUrls: uploadedPhotoUrls,
      });

      // Free blob URLs
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));

      showToast("Listing created successfully!");
      setTimeout(() => navigate("/vendor/home"), 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F0]">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-[#F5F5F0]/95 backdrop-blur-sm border-b border-black/5">
        <div
          className="flex items-center gap-3 px-4 sm:px-6 py-3.5 mx-auto"
          style={{ maxWidth: "min(100%, 44rem)" }}
        >
          <button
            type="button"
            onClick={() => navigate("/vendor/home")}
            className="p-1.5 -ml-1.5 rounded-lg text-[#1C1B1B] hover:bg-black/5 active:scale-95 transition-all"
            aria-label="Back to Vendor Home"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex flex-col min-w-0">
            <h1 className="text-base font-bold text-[#1C1B1B] m-0 leading-tight">
              Create New Listing
            </h1>
            <p className="text-[11px] text-[#747878] m-0 leading-tight">
              Step 1 of 1 · Basic Info
            </p>
          </div>
        </div>
      </header>

      {/* ── Form ────────────────────────────────────────────────────────── */}
      <main
        className="flex-1 w-full mx-auto px-4 sm:px-6 pt-5 pb-32"
        style={{ maxWidth: "min(100%, 44rem)" }}
      >
        <form
          id="create-listing-form"
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5"
        >
          {/* ── Global submit error ──────────────────────────────────────── */}
          {submitError && (
            <div
              role="alert"
              className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
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
                    {displayBusinessName}
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
                    {displayCategory}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Location (Draggable Map) ──────────────────────────────────── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 px-1">
              Business Location
            </label>
            <LocationPickerMap onLocationChange={handleLocationChange} />
            {errors.location && (
              <p className="text-xs text-red-500 px-1">{errors.location}</p>
            )}
            {locationMoved && location && (
              <p className="text-[11px] text-[#747878] px-1">
                Pin set at {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </p>
            )}
          </div>

          {/* ── Business Description ─────────────────────────────────────── */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="business-description"
              className="text-sm font-medium text-gray-700 px-1"
            >
              Business Description
            </label>
            <textarea
              id="business-description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: undefined }));
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

          {/* ── Upload Photos ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-sm font-medium text-gray-700">
                Upload Photos
                <span className="ml-1 text-xs font-normal text-[#747878]">
                  (optional · max 5)
                </span>
              </label>
            </div>

            {/* Thumbnail strip */}
            {photos.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {photos.map((photo, idx) => (
                  <div
                    key={photo.previewUrl}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border border-black/10 shadow-xs group"
                  >
                    <img
                      src={photo.previewUrl}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      aria-label={`Remove photo ${idx + 1}`}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>
                ))}

                {/* Add more slot (visible if < 5) */}
                {photos.length < 5 && (
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

            {/* Empty state dropzone */}
            {photos.length === 0 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-8 flex flex-col items-center justify-center gap-2 hover:border-[#F5B800] hover:bg-yellow-50/30 transition-colors group"
                aria-label="Upload photos"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-yellow-100 flex items-center justify-center transition-colors">
                  <Camera className="w-5 h-5 text-gray-400 group-hover:text-[#F5B800] transition-colors" aria-hidden="true" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 m-0">
                    Tap to add photos
                  </p>
                  <p className="text-xs text-[#747878] m-0 mt-0.5">
                    JPG, PNG · Up to 5 photos
                  </p>
                </div>
              </button>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              aria-hidden="true"
              onChange={handlePhotoSelect}
            />

            {/* Transparent note about upload */}
            <p className="text-[11px] text-[#A4A7A7] px-1 m-0">
              Supported formats: JPG, PNG, WEBP (up to 5 photos, max 5MB each).
            </p>
          </div>
        </form>
      </main>

      {/* ── Sticky Bottom CTA ────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#F5F5F0]/95 backdrop-blur-sm border-t border-black/5 px-4 sm:px-6 py-4 safe-area-inset-bottom">
        <div className="mx-auto" style={{ maxWidth: "min(100%, 44rem)" }}>
          <PrimaryButton
            type="submit"
            form="create-listing-form"
            width="full"
            disabled={isSubmitting}
            className="py-4 text-base"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                {photos.length > 0 ? "Uploading & Creating…" : "Submitting…"}
              </span>
            ) : (
              "ADD LISTING"
            )}
          </PrimaryButton>
        </div>
      </div>

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      <Toast message={toastMessage} />
    </div>
  );
};

export default CreateListing;

