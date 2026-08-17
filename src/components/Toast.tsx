import { CheckCircle2 } from "lucide-react";

interface ToastProps {
  message: string | null;
  onClose?: () => void;
  className?: string;
}

/**
 * Shared floating Toast notification component.
 * Uses lucide-react CheckCircle2 icon and accessible role="status".
 */
export const Toast = ({ message, className = "" }: ToastProps) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1C1B1B] text-white px-5 py-3 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200 ${className}`}
    >
      <CheckCircle2 className="w-4 h-4 text-[#79F7E3] shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
};

export default Toast;
