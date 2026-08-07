import type { ButtonHTMLAttributes } from "react";

interface NotificationBellProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Show a red notification dot. Defaults to false. */
  hasUnread?: boolean;
  /** Dark theme variant. Defaults to false (light theme). */
  dark?: boolean;
}

/**
 * Bell icon button for notifications, with optional unread dot.
 * Appears top-right on: Profile, Nearby Essentials pages.
 */
const NotificationBell = ({
  hasUnread = false,
  dark = false,
  className = "",
  ...rest
}: NotificationBellProps) => {
  const containerColor = dark
    ? "bg-white/10 text-white hover:bg-white/20"
    : "bg-gray-100 text-gray-700 hover:bg-gray-200";

  return (
    <button
      type="button"
      aria-label="Notifications"
      className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${containerColor} ${className}`}
      {...rest}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      {hasUnread && (
        <span
          aria-label="Unread notifications"
          className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"
        />
      )}
    </button>
  );
};

export default NotificationBell;
