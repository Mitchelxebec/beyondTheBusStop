import type { ConfidenceLevel } from "../types/routes";

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  /**
   * Optional variant:
   * - "default" (Figma node 178:248): Uppercase block badge (e.g. HIGH CONFIDENCE)
   * - "pill": Rounded pill badge with dot indicator
   */
  variant?: "default" | "pill";
  className?: string;
}

const DEFAULT_STYLES: Record<ConfidenceLevel, string> = {
  High:   "bg-[#79F7E3] text-[#005047]",
  Medium: "bg-[#FFF4D6] text-[#6F5400]",
  Low:    "bg-[#FCE8E6] text-[#BA1A1A]",
};

const PILL_STYLES: Record<ConfidenceLevel, { bg: string; text: string; dot: string }> = {
  High:   { bg: "bg-[#E6FAF6]", text: "text-[#007A62]", dot: "bg-[#00C9A7]" },
  Medium: { bg: "bg-[#FFF8E6]", text: "text-[#8A6200]", dot: "bg-[#F5B800]" },
  Low:    { bg: "bg-[#FFF0F0]", text: "text-[#9B1B1B]", dot: "bg-red-400" },
};

/**
 * Shared ConfidenceBadge component.
 * Canonical implementation based on Figma Node 178:248.
 */
export const ConfidenceBadge = ({
  level,
  variant = "default",
  className = "",
}: ConfidenceBadgeProps) => {
  // Normalize string levels defensively (e.g. Moderate -> Medium)
  const normalizedLevel: ConfidenceLevel =
    level === ("Moderate" as any) ? "Medium" : level || "Low";

  if (variant === "pill") {
    const s = PILL_STYLES[normalizedLevel] || PILL_STYLES.Low;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${s.bg} ${s.text} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
        {normalizedLevel} Confidence
      </span>
    );
  }

  // Default Figma Uppercase Block Badge
  const styleClass = DEFAULT_STYLES[normalizedLevel] || DEFAULT_STYLES.Low;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide leading-none ${styleClass} ${className}`}
    >
      {normalizedLevel} CONFIDENCE
    </span>
  );
};

export default ConfidenceBadge;
