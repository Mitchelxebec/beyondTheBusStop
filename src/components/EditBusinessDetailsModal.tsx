import React, { useState, useEffect } from "react";
import { X, Store, AlertCircle } from "lucide-react";
import { updateProfile } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";

interface EditBusinessDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBusinessName?: string;
  initialCategory?: string;
  initialBusinessAddress?: string | null;
  onSuccess?: () => void;
}

export const EditBusinessDetailsModal: React.FC<EditBusinessDetailsModalProps> = ({
  isOpen,
  onClose,
  initialBusinessName = "",
  initialCategory = "",
  initialBusinessAddress = "",
  onSuccess,
}) => {
  const { session, setSession } = useAuth();
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [category, setCategory] = useState(initialCategory);
  const [businessAddress, setBusinessAddress] = useState(
    initialBusinessAddress || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBusinessName(initialBusinessName);
      setCategory(initialCategory);
      setBusinessAddress(initialBusinessAddress || "");
      setErrorMessage(null);
    }
  }, [isOpen, initialBusinessName, initialCategory, initialBusinessAddress]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setErrorMessage("Business name cannot be empty.");
      return;
    }
    if (!category.trim()) {
      setErrorMessage("Business category cannot be empty.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await updateProfile({
        businessName: businessName.trim(),
        category: category.trim(),
        businessAddress: businessAddress.trim() ? businessAddress.trim() : null,
      });

      // Update context session state
      if (session) {
        setSession({
          ...session,
          user: {
            ...session.user,
            businessName: res.user.businessName || businessName.trim(),
            category: res.user.category || category.trim(),
            businessAddress: res.user.businessAddress || (businessAddress.trim() || null),
          },
        });
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update business details.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-business-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full shadow-2xl flex flex-col overflow-hidden border border-black/10 animate-in slide-in-from-bottom-5 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-black/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#005047]/10 flex items-center justify-center text-[#005047] shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 id="edit-business-title" className="text-base font-bold text-[#1C1B1B] m-0">
                Business Details
              </h3>
              <p className="text-xs text-[#747878] m-0 mt-0.5">
                Update your commercial profile
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F1EE] flex items-center justify-center text-[#444748] hover:text-[#1C1B1B] hover:bg-[#EBE8E7] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-4">
          {errorMessage && (
            <div className="bg-[#FCE8E6] text-[#BA1A1A] text-xs font-semibold p-3 rounded-xl flex items-center gap-2 border border-[#BA1A1A]/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-business-name" className="text-xs font-bold text-[#1C1B1B]">
              Business Name
            </label>
            <input
              id="edit-business-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Iya Basira Buka & Drinks"
              className="w-full text-xs p-3 rounded-xl border border-neutral-200 focus:border-[#005047] focus:ring-1 focus:ring-[#005047] outline-none transition-all text-[#1C1B1B]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-business-category" className="text-xs font-bold text-[#1C1B1B]">
              Business Category
            </label>
            <input
              id="edit-business-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Food & Dining, POS & Airtime, Retail"
              className="w-full text-xs p-3 rounded-xl border border-neutral-200 focus:border-[#005047] focus:ring-1 focus:ring-[#005047] outline-none transition-all text-[#1C1B1B]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-business-address" className="text-xs font-bold text-[#1C1B1B]">
              Business Address (Optional)
            </label>
            <input
              id="edit-business-address"
              type="text"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              placeholder="e.g. Beside Main Terminal Gate 2, Oshodi"
              className="w-full text-xs p-3 rounded-xl border border-neutral-200 focus:border-[#005047] focus:ring-1 focus:ring-[#005047] outline-none transition-all text-[#1C1B1B]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <SecondaryButton
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              width="full"
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={isSubmitting}
              width="full"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBusinessDetailsModal;
