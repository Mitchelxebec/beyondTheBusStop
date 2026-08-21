import React, { useState } from "react";
import { X, Flag, AlertCircle } from "lucide-react";
import { createReport } from "../services/reports";
import type { ReportType } from "../types/reports";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";

interface ReportRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeId: string;
  originName?: string;
  destName?: string;
  onSuccess?: () => void;
}

const REPORT_OPTIONS: Array<{
  type: ReportType;
  label: string;
  description: string;
}> = [
  {
    type: "incorrect_route",
    label: "Incorrect Route Corridor",
    description: "Stops, terminals, or route paths along this corridor are inaccurate.",
  },
  {
    type: "outdated_fare",
    label: "Outdated Fare Range",
    description: "Actual transit fares paid on this route differ from the estimates.",
  },
  {
    type: "inaccurate_information",
    label: "Inaccurate Guidance",
    description: "Boarding, transfer, or alighting directions need correction.",
  },
];

export const ReportRouteModal: React.FC<ReportRouteModalProps> = ({
  isOpen,
  onClose,
  routeId,
  originName,
  destName,
  onSuccess,
}) => {
  const [selectedType, setSelectedType] = useState<ReportType>("outdated_fare");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await createReport({
        routeId,
        reportType: selectedType,
        description: description.trim() ? description.trim() : undefined,
      });

      setDescription("");
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit route report. Please check your connection.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full shadow-2xl flex flex-col overflow-hidden border border-black/10 animate-in slide-in-from-bottom-5 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-black/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#BA1A1A]/10 flex items-center justify-center text-[#BA1A1A] shrink-0">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 id="report-modal-title" className="text-base font-bold text-[#1C1B1B] m-0">
                Report Route Issue
              </h3>
              {originName && destName && (
                <p className="text-xs text-[#747878] m-0 mt-0.5 truncate max-w-xs">
                  {originName} → {destName}
                </p>
              )}
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

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#1C1B1B]">
              What issue did you notice?
            </label>
            <div className="flex flex-col gap-2">
              {REPORT_OPTIONS.map((opt) => {
                const isSelected = selectedType === opt.type;
                return (
                  <label
                    key={opt.type}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#005047] bg-[#005047]/5 shadow-xs"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportType"
                      value={opt.type}
                      checked={isSelected}
                      onChange={() => setSelectedType(opt.type)}
                      className="mt-1 accent-[#005047]"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#1C1B1B]">
                        {opt.label}
                      </span>
                      <span className="text-[11px] text-[#747878] mt-0.5">
                        {opt.description}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="report-description" className="text-xs font-bold text-[#1C1B1B]">
                Additional Details (Optional)
              </label>
              <span className="text-[10px] text-[#747878]">
                {description.length}/500
              </span>
            </div>
            <textarea
              id="report-description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              placeholder="Provide any specific details (e.g. recent price increase, landmark change)..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-neutral-200 focus:border-[#005047] focus:ring-1 focus:ring-[#005047] outline-none transition-all resize-none text-[#1C1B1B]"
            />
          </div>

          {/* Action Buttons */}
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
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportRouteModal;
