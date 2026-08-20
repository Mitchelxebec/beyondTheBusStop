import { Phone, X, HelpCircle, Clock, ShieldCheck } from "lucide-react";

// ─── Support Constants ─────────────────────────────────────────────────────────

export const SUPPORT_PHONE_NUMBER = "+18637589309";
export const SUPPORT_PHONE_DISPLAY = "+1 863-758-9309";
export const SUPPORT_TEL_HREF = "tel:+18637589309";

export interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  role?: "commuter" | "vendor" | "general";
}

/**
 * HelpSupportModal
 *
 * Shared support modal providing real assistance details and a direct
 * tap-to-call action to +18637589309.
 */
const HelpSupportModal = ({
  isOpen,
  onClose,
  title = "Help & Support",
  subtitle = "We're here to help you get the most out of Beyond The Bus Stop.",
  role = "general",
}: HelpSupportModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#F5F5F0] rounded-3xl max-w-sm sm:max-w-md w-full shadow-2xl flex flex-col overflow-hidden border border-black/10 animate-in fade-in zoom-in-95 duration-150 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-white border-b border-black/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00C9A7]/15 flex items-center justify-center text-[#005047] shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="help-modal-title" className="text-base font-bold text-[#1C1B1B] m-0">
                {title}
              </h3>
              <p className="text-[11px] text-[#747878] m-0 mt-0.5">
                Support & Contact
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close help modal"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center text-gray-600 transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-4">
          <p className="text-xs sm:text-sm text-[#444748] m-0 leading-relaxed">
            {subtitle}
          </p>

          {/* Key Information Cards */}
          <div className="flex flex-col gap-2.5 bg-white rounded-2xl p-4 border border-black/5">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#005047] shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#1C1B1B]">24/7 Assistance</span>
                <span className="text-[11px] text-[#747878]">
                  {role === "vendor"
                    ? "Assistance with business listings, promotions, and billing."
                    : role === "commuter"
                    ? "Assistance with route planning, saved corridors, and safety."
                    : "Immediate help with your account and inquiries."}
                </span>
              </div>
            </div>

            <div className="h-px bg-neutral-100" />

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#005047] shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#1C1B1B]">Direct Phone Support</span>
                <span className="text-[11px] text-[#747878]">
                  Call our dedicated helpline directly from your phone.
                </span>
              </div>
            </div>
          </div>

          {/* Tap-to-Call Primary Action */}
          <a
            href={SUPPORT_TEL_HREF}
            id="support-call-link"
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-[#005047] text-white font-bold text-sm hover:bg-[#003B34] active:scale-[0.99] transition-all shadow-sm text-center"
          >
            <Phone className="w-4 h-4" />
            <span>Call Support ({SUPPORT_PHONE_DISPLAY})</span>
          </a>

          {/* Dismiss / Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-semibold text-[#444748] hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportModal;
