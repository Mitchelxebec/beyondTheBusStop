import type { Route, ConfidenceLevel } from "../types/routes";

const CONFIDENCE_CLASSES: Record<ConfidenceLevel, { bg: string; text: string; dot: string }> = {
  High:   { bg: "bg-[#E6FAF6]", text: "text-[#007A62]", dot: "bg-[#00C9A7]" },
  Medium: { bg: "bg-[#FFF8E6]", text: "text-[#8A6200]", dot: "bg-[#F5B800]" },
  Low:    { bg: "bg-[#FFF0F0]", text: "text-[#9B1B1B]", dot: "bg-red-400" },
};

const ConfidenceBadge = ({ level }: { level: ConfidenceLevel }) => {
  const s = CONFIDENCE_CLASSES[level] || CONFIDENCE_CLASSES.Low;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {level} Confidence
    </span>
  );
};

interface RouteDetailModalProps {
  route: Route | null;
  onClose: () => void;
}

/**
 * Shared Route Detail Preview Modal.
 * Used on both Commuter Home Dashboard and Search Results for unified route inspection.
 */
export const RouteDetailModal = ({ route, onClose }: RouteDetailModalProps) => {
  if (!route) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="route-detail-title"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-black/10 flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/8 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#747878]">
              Route Corridor Details
            </span>
            <h3 id="route-detail-title" className="text-lg font-bold text-[#1C1B1B] m-0">
              {route.origin} → {route.destination}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F1EE] flex items-center justify-center text-[#444748] hover:bg-[#EAE7E4] transition-colors"
            aria-label="Close route details"
          >
            ✕
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 bg-[#F9F8F6] p-4 rounded-xl border border-black/5 text-center">
          <div>
            <span className="text-xs text-[#747878] block">Fare Range</span>
            <span className="text-base font-bold text-[#1C1B1B]">
              ₦{route.fareLow.toLocaleString()} – ₦{route.fareHigh.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-xs text-[#747878] block">Transit Mode</span>
            <span className="text-base font-bold text-[#1C1B1B] capitalize">
              {route.vehicleType}
            </span>
          </div>
        </div>

        {/* Confidence & Additional Details */}
        <div className="flex flex-col gap-2 text-sm text-[#444748]">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#1C1B1B]">Confidence Score</span>
            <ConfidenceBadge level={route.confidenceLevel} />
          </div>
          {route.averageFare !== undefined && (
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1C1B1B]">Average Confirmed Fare</span>
              <span className="font-bold text-[#005047]">
                ₦{route.averageFare.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-[#1A1A1A] text-white font-semibold text-sm hover:bg-black transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteDetailModal;
