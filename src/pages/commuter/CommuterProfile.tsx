import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNavBar, PageHeader, NotificationBell, Toast } from "../../components";
import { useAuth } from "../../contexts/AuthContext";

// ── Types & Placeholder Data ───────────────────────────────────────────────────

/**
 * Commuter Profile Stats & Preferences shape.
 *
 * // TODO: replace with real API response when user-stats endpoint exists
 * // (feature agreed with team, not yet in PRD or backend as of 2026-08-14).
 * // Backend GET /api/auth/profile currently returns only basic user identity fields.
 */
interface CommuterStats {
  routesCount: number;
  tripsCount: number;
  badgesCount: number;
  commuterLevel: number;
}

const STATIC_STATS: CommuterStats = {
  routesCount: 12,
  tripsCount: 48,
  badgesCount: 3,
  commuterLevel: 4,
};

// ── Icons ──────────────────────────────────────────────────────────────────────

const BookmarkNavIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const BellMenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const HelpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const StorefrontIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CheckCircleBadge = () => (
  <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#00875A] border-2 border-white flex items-center justify-center text-white shadow-sm" aria-label="Verified commuter">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </span>
);

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Commuter Profile Screen — Figma node 178:387.
 * Displays user identity, stats card, navigation menu items,
 * direct link to Vendors Dashboard (/vendor/home), and session logout.
 */
const CommuterProfile = () => {
  const navigate = useNavigate();
  const { session, clearSession } = useAuth();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Real user identity from session with fallback placeholder
  const userName = session?.user?.fullName ?? "Tunde Bakare";

  // Logout handler
  const handleLogout = () => {
    clearSession();
    navigate("/auth/commuter/login", { replace: true });
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#FDFCFA] text-[#1C1B1B]">
      {/* 1 · Fixed Top Navigation Bar (Untouched per core rules) */}
      <BottomNavBar />

      {/* 2 · Main Content Area */}
      <main
        id="profile-main"
        className="flex-1 w-full mx-auto pt-16"
        style={{ maxWidth: "min(100%, 68rem)" }}
        aria-label="Commuter profile content"
      >
        <div className="flex flex-col gap-6 px-4 sm:px-6 pt-6 pb-16">
          
          {/* Header Title with Notification Bell */}
          <PageHeader
            title="Profile"
            className="px-0 pt-0 pb-0"
            trailing={
              <NotificationBell
                hasUnread={false}
                onClick={() => setActiveModal("Notifications")}
              />
            }
          />

          {/* User Hero Section (Avatar + Name + Level) */}
          <section
            aria-labelledby="profile-user-heading"
            className="flex flex-col items-center justify-center text-center pt-2"
          >
            {/* Avatar with Verified Badge */}
            <div className="relative mb-3.5">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-[#EBE8E7] flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80"
                  alt={userName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to stylized initials if image fails
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <span className="text-2xl font-bold text-[#444748]">
                  {userName.charAt(0)}
                </span>
              </div>
              <CheckCircleBadge />
            </div>

            {/* User Name */}
            <h1
              id="profile-user-heading"
              className="text-xl font-bold tracking-tight text-[#1C1B1B] m-0"
            >
              {userName}
            </h1>

            {/* Commuter Level Badge */}
            <div className="flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full bg-[#EFECE8] text-[#5A5C5D] text-xs font-semibold tracking-wider uppercase">
              <span className="text-[#FFC72C]">★</span>
              <span>COMMUTER LEVEL {STATIC_STATS.commuterLevel}</span>
            </div>
          </section>

          {/* Commuter Stats Section (3 Columns Card) */}
          <section aria-label="Commuter statistics" className="w-full">
            <div className="grid grid-cols-3 bg-[#F4F1EE] rounded-2xl p-4 sm:p-5 border border-black/5 shadow-sm text-center">
              {/* Stat 1 · Routes */}
              <div className="flex flex-col items-center justify-center border-r border-black/8 pr-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#1C1B1B]">
                  {STATIC_STATS.routesCount}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#747878] uppercase tracking-wider mt-0.5">
                  Routes
                </span>
              </div>

              {/* Stat 2 · Trips */}
              <div className="flex flex-col items-center justify-center border-r border-black/8 px-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#1C1B1B]">
                  {STATIC_STATS.tripsCount}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#747878] uppercase tracking-wider mt-0.5">
                  Trips
                </span>
              </div>

              {/* Stat 3 · Badges (Gold Highlight) */}
              <div className="flex flex-col items-center justify-center pl-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#946A00]">
                  {STATIC_STATS.badgesCount}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#946A00] uppercase tracking-wider mt-0.5">
                  Badges
                </span>
              </div>
            </div>
          </section>

          {/* Menu Action Items Card */}
          <section aria-label="Account navigation menu" className="w-full">
            <div className="bg-white rounded-2xl border border-black/6 shadow-sm overflow-hidden divide-y divide-black/5">
              
              {/* Item 1 · Saved Routes */}
              <button
                type="button"
                id="menu-saved-routes"
                onClick={() => navigate("/saved-routes")}
                className="w-full flex items-center justify-between p-4 hover:bg-[#F9F8F6] transition-colors text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F4F1EE] flex items-center justify-center text-[#444748] group-hover:text-[#1C1B1B] transition-colors">
                    <BookmarkNavIcon />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-semibold text-[#1C1B1B] m-0">
                      Saved Routes
                    </h2>
                    <p className="text-xs text-[#747878] m-0 mt-0.5">
                      Manage your daily commutes
                    </p>
                  </div>
                </div>
                <span className="text-[#A4A7A7] group-hover:text-[#1C1B1B] transition-colors">
                  <ChevronRightIcon />
                </span>
              </button>

              {/* Item 2 · Notifications */}
              <button
                type="button"
                id="menu-notifications"
                onClick={() => setActiveModal("Notifications & Alerts")}
                className="w-full flex items-center justify-between p-4 hover:bg-[#F9F8F6] transition-colors text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F4F1EE] flex items-center justify-center text-[#444748] group-hover:text-[#1C1B1B] transition-colors">
                    <BellMenuIcon />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-semibold text-[#1C1B1B] m-0">
                      Notifications
                    </h2>
                    <p className="text-xs text-[#747878] m-0 mt-0.5">
                      Alerts and delay updates
                    </p>
                  </div>
                </div>
                <span className="text-[#A4A7A7] group-hover:text-[#1C1B1B] transition-colors">
                  <ChevronRightIcon />
                </span>
              </button>

              {/* Item 3 · Settings */}
              <button
                type="button"
                id="menu-settings"
                onClick={() => setActiveModal("Account Settings")}
                className="w-full flex items-center justify-between p-4 hover:bg-[#F9F8F6] transition-colors text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F4F1EE] flex items-center justify-center text-[#444748] group-hover:text-[#1C1B1B] transition-colors">
                    <SettingsIcon />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-semibold text-[#1C1B1B] m-0">
                      Settings
                    </h2>
                    <p className="text-xs text-[#747878] m-0 mt-0.5">
                      App preferences and account
                    </p>
                  </div>
                </div>
                <span className="text-[#A4A7A7] group-hover:text-[#1C1B1B] transition-colors">
                  <ChevronRightIcon />
                </span>
              </button>

              {/* Item 4 · Help & Support */}
              <button
                type="button"
                id="menu-help"
                onClick={() => setActiveModal("Help & Support Center")}
                className="w-full flex items-center justify-between p-4 hover:bg-[#F9F8F6] transition-colors text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F4F1EE] flex items-center justify-center text-[#444748] group-hover:text-[#1C1B1B] transition-colors">
                    <HelpIcon />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-semibold text-[#1C1B1B] m-0">
                      Help & Support
                    </h2>
                    <p className="text-xs text-[#747878] m-0 mt-0.5">
                      FAQs and contact us
                    </p>
                  </div>
                </div>
                <span className="text-[#A4A7A7] group-hover:text-[#1C1B1B] transition-colors">
                  <ChevronRightIcon />
                </span>
              </button>

            </div>
          </section>

          {/* Vendors Dashboard CTA Card — preserved for future vendor onboarding */}
          <section aria-label="Vendors Dashboard link">
            <button
              type="button"
              id="vendors-dashboard-btn"
              onClick={() => showToast("Vendor signup and merchant portal onboarding are coming soon!")}
              className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#FFF4D6] border border-[#FFC72C]/40 text-[#1C1B1B] shadow-xs hover:bg-[#FFECC0] active:scale-[0.99] transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#4A3B00] text-[#FFC72C] flex items-center justify-center shrink-0">
                  <StorefrontIcon />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#1C1B1B] m-0">
                      Vendors Dashboard
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-[#FFC72C] text-[#4A3B00]">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#747878] font-normal m-0 mt-0.5">
                    Vendor signup coming soon — manage transit corridor listings
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#EAE7E4] text-[#444748] flex items-center justify-center shrink-0 group-hover:bg-[#DFDCD8] transition-colors">
                <ChevronRightIcon />
              </div>
            </button>
          </section>

          {/* Logout Action Button */}
          <section aria-label="Account logout" className="pt-2">
            <button
              type="button"
              id="logout-btn"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-white border border-[#E05252]/20 text-[#D32F2F] font-semibold text-sm hover:bg-[#FEECEC] active:scale-[0.99] transition-all shadow-sm"
            >
              <LogoutIcon />
              <span>Log Out</span>
            </button>
          </section>

        </div>
      </main>

      {/* Lightweight modal stub for non-data menu triggers */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-black/10 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#1C1B1B] m-0">
              {activeModal}
            </h3>
            <p className="text-sm text-[#444748] m-0">
              This section is configured and ready for live user preferences when the backend configuration service is connected.
            </p>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1C1B1B] text-white font-medium text-sm hover:bg-black transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
};

export default CommuterProfile;
