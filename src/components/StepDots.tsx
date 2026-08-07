interface StepDotsProps {
  /** Total number of steps/slides. */
  total: number;
  /** Zero-based index of the active step. */
  current: number;
}

/**
 * Horizontal pagination dots for onboarding / carousel screens.
 * Active dot is wider (pill shape) and amber; inactive dots are grey circles.
 * Appears on: Onboarding slides (Step 1 of 3, etc.).
 */
const StepDots = ({ total, current }: StepDotsProps) => {
  return (
    <div className="flex items-center gap-2" role="tablist" aria-label="Steps">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          role="tab"
          aria-selected={i === current}
          aria-label={`Step ${i + 1}`}
          className={`rounded-full transition-all duration-300 ${
            i === current
              ? "w-6 h-2 bg-[#F5B800]"
              : "w-2 h-2 bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

export default StepDots;
