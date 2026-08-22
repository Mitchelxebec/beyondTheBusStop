import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Coins, ThumbsUp, HelpCircle, Navigation } from "lucide-react";
import { createConfirmation } from "../services/confirmations";
import type { CreateConfirmationResponse } from "../types/confirmations";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";

interface ConfirmRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeId: string;
  originName?: string;
  destName?: string;
  initialFare?: number;
  onSuccess?: (response: CreateConfirmationResponse) => void;
}

const FARE_FAIRNESS_OPTIONS = [
  { value: 1, label: "1 — Very Expensive", desc: "Overpriced / excessive" },
  { value: 2, label: "2 — Slightly High", desc: "Above usual fare" },
  { value: 3, label: "3 — Normal Fare", desc: "Expected standard price" },
  { value: 4, label: "4 — Fair & Reasonable", desc: "Good price for distance" },
  { value: 5, label: "5 — Great Value", desc: "Very cheap / economical" },
];

const EASE_OPTIONS = [
  { value: 1, label: "1 — Very Difficult", desc: "Long wait / scarce vehicles" },
  { value: 2, label: "2 — Difficult", desc: "Few vehicles available" },
  { value: 3, label: "3 — Moderate", desc: "Normal queue / wait time" },
  { value: 4, label: "4 — Easy", desc: "Vehicles readily available" },
  { value: 5, label: "5 — Very Easy", desc: "Boarded immediately" },
];

export const ConfirmRouteModal: React.FC<ConfirmRouteModalProps> = ({
  isOpen,
  onClose,
  routeId,
  originName,
  destName,
  initialFare,
  onSuccess,
}) => {
  // 1. Form state
  const [confirmedFare, setConfirmedFare] = useState<string>("");
  const [fareFairness, setFareFairness] = useState<number | null>(null);
  const [everOvercharged, setEverOvercharged] = useState<boolean | null>(null);
  const [easeFindingTransport, setEaseFindingTransport] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfirmedFare(
        typeof initialFare === "number" && !isNaN(initialFare) && initialFare > 0
          ? String(initialFare)
          : ""
      );
      setFareFairness(null);
      setEverOvercharged(null);
      setEaseFindingTransport(null);
      setNotes("");
      setErrorMessage(null);
    }
  }, [isOpen, initialFare]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const numericFare = Number(confirmedFare);
    if (isNaN(numericFare) || numericFare < 0 || confirmedFare.trim() === "") {
      setErrorMessage("Please enter a valid fare amount (₦).");
      return;
    }

    if (fareFairness === null) {
      setErrorMessage("Please rate the fairness of the fare you paid.");
      return;
    }

    if (everOvercharged === null) {
      setErrorMessage("Please indicate if you were overcharged on this trip.");
      return;
    }

    if (easeFindingTransport === null) {
      setErrorMessage("Please select how easy it was to find / board transport.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createConfirmation(routeId, {
        routeId,
        confirmedFare: numericFare,
        fareFairness,
        everOvercharged,
        easeFindingTransport,
        notes: notes.trim() ? notes.trim() : undefined,
      });

      if (onSuccess) {
        onSuccess(response);
      }
      onClose();
    } catch (err: any) {
      // Prioritize verbatim backend message (including 429 cooldowns and 400 validation errors)
      const backendMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to submit confirmation. Please check your connection and try again.";

      setErrorMessage(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-route-modal-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-black/10 animate-in slide-in-from-bottom-5 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-black/5 shrink-0 bg-[#FDFAF8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#005047]/10 flex items-center justify-center text-[#005047] shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="confirm-route-modal-title" className="text-base font-bold text-[#1C1B1B] m-0">
                Confirm Route Experience
              </h3>
              {originName && destName && (
                <p className="text-xs text-[#747878] m-0 mt-0.5 truncate max-w-xs font-medium">
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-5">
          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="bg-[#FCE8E6] text-[#BA1A1A] text-xs font-semibold p-3.5 rounded-xl flex items-start gap-2.5 border border-[#BA1A1A]/20 animate-in fade-in duration-150"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* 1 · Fare Paid */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmed-fare-input" className="text-xs font-bold text-[#1C1B1B] flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-[#005047]" />
              <span>How much fare did you pay?</span>
              <span className="text-[#BA1A1A]">*</span>
            </label>
            <p className="text-[11px] text-[#747878] m-0">
              Enter the actual transit fare you paid in Naira.
            </p>
            <div className="relative mt-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#747878] select-none">
                ₦
              </span>
              <input
                id="confirmed-fare-input"
                type="number"
                min="0"
                step="50"
                value={confirmedFare}
                onChange={(e) => setConfirmedFare(e.target.value)}
                placeholder="e.g. 600"
                className="w-full text-sm font-bold pl-8 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:border-[#005047] focus:ring-1 focus:ring-[#005047] outline-none transition-all text-[#1C1B1B] bg-white"
                required
              />
            </div>
          </div>

          {/* 2 · Fare Fairness (1-5) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1C1B1B] flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5 text-[#005047]" />
                <span>How fair was this fare?</span>
                <span className="text-[#BA1A1A]">*</span>
              </label>
              {fareFairness !== null && (
                <span className="text-[11px] font-bold text-[#005047]">
                  {FARE_FAIRNESS_OPTIONS.find((opt) => opt.value === fareFairness)?.label}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5">
              {FARE_FAIRNESS_OPTIONS.map((opt) => {
                const isSelected = fareFairness === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFareFairness(opt.value)}
                    className={`flex sm:flex-col items-center justify-between sm:justify-center p-2.5 sm:py-2.5 sm:px-1.5 rounded-xl border text-left sm:text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#005047] bg-[#005047] text-white shadow-xs font-bold"
                        : "border-neutral-200 bg-white hover:border-neutral-300 text-[#1C1B1B] hover:bg-neutral-50"
                    }`}
                  >
                    <span className="text-xs font-bold">{opt.value}</span>
                    <span
                      className={`text-[10px] line-clamp-1 mt-0.5 ${
                        isSelected ? "text-white/90" : "text-[#747878]"
                      }`}
                      title={opt.desc}
                    >
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 · Overcharged Question (Boolean) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#1C1B1B] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#005047]" />
              <span>Did the conductor or driver overcharge you?</span>
              <span className="text-[#BA1A1A]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setEverOvercharged(false)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  everOvercharged === false
                    ? "border-[#005047] bg-[#005047]/10 text-[#005047] ring-1 ring-[#005047]"
                    : "border-neutral-200 bg-white hover:border-neutral-300 text-[#1C1B1B]"
                }`}
              >
                <span>No, Standard Price</span>
              </button>
              <button
                type="button"
                onClick={() => setEverOvercharged(true)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  everOvercharged === true
                    ? "border-[#BA1A1A] bg-[#BA1A1A]/10 text-[#BA1A1A] ring-1 ring-[#BA1A1A]"
                    : "border-neutral-200 bg-white hover:border-neutral-300 text-[#1C1B1B]"
                }`}
              >
                <span>Yes, Overcharged</span>
              </button>
            </div>
          </div>

          {/* 4 · Ease of Finding Transport (1-5) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1C1B1B] flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#005047]" />
                <span>How easy was it to find / board transport?</span>
                <span className="text-[#BA1A1A]">*</span>
              </label>
              {easeFindingTransport !== null && (
                <span className="text-[11px] font-bold text-[#005047]">
                  {EASE_OPTIONS.find((opt) => opt.value === easeFindingTransport)?.label}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5">
              {EASE_OPTIONS.map((opt) => {
                const isSelected = easeFindingTransport === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEaseFindingTransport(opt.value)}
                    className={`flex sm:flex-col items-center justify-between sm:justify-center p-2.5 sm:py-2.5 sm:px-1.5 rounded-xl border text-left sm:text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#005047] bg-[#005047] text-white shadow-xs font-bold"
                        : "border-neutral-200 bg-white hover:border-neutral-300 text-[#1C1B1B] hover:bg-neutral-50"
                    }`}
                  >
                    <span className="text-xs font-bold">{opt.value}</span>
                    <span
                      className={`text-[10px] line-clamp-1 mt-0.5 ${
                        isSelected ? "text-white/90" : "text-[#747878]"
                      }`}
                      title={opt.desc}
                    >
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5 · Optional Notes */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="confirmation-notes" className="text-xs font-bold text-[#1C1B1B]">
                Commuter Notes (Optional)
              </label>
              <span className="text-[10px] text-[#747878]">{notes.length}/300</span>
            </div>
            <textarea
              id="confirmation-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 300))}
              placeholder="e.g. Traffic near junction, bus loaded quickly at main park..."
              rows={2}
              className="w-full text-xs p-3 rounded-xl border border-neutral-200 focus:border-[#005047] focus:ring-1 focus:ring-[#005047] outline-none transition-all resize-none text-[#1C1B1B] bg-white"
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
              {isSubmitting ? "Submitting..." : "Submit Confirmation"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmRouteModal;
