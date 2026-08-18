import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Store,
  CreditCard,
  BadgeCheck,
  LayoutDashboard,
  ArrowLeft,
  Star,
} from "lucide-react";
import { BottomNavBar, Toast, VENDOR_NAV_ITEMS } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import { getProfile } from "../../services/auth";
import { useRoutes } from "../../hooks/useRoutes";

// ─── Figma-matched Section Label ──────────────────────────────────────────────

const SettingsGroupLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#747878] px-1">
    {children}
  </span>
);

// ─── Menu Row ─────────────────────────────────────────────────────────────────

interface MenuRowProps {
  id: string;
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  subtitle: string;
  onClick: () => void;
  trailing?: React.ReactNode;
}

const MenuRow = ({ id, icon, iconBg = "bg-[#F4F1EE]", title, subtitle, onClick, trailing }: MenuRowProps) => (
  <button
    type="button"
    id={id}
    onClick={onClick}
    className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#F9F8F6] active:bg-[#F4F1EE] transition-colors text-left group"
  >
    <div className="flex items-center gap-3.5">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center text-[#444748] shrink-0 group-hover:text-[#1C1B1B] transition-colors`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-[#1C1B1B] m-0">{title}</p>
        <p className="text-xs text-[#747878] m-0 mt-0.5">{subtitle}</p>
      </div>
    </div>
    <span className="text-[#A4A7A7] group-hover:text-[#444748] transition-colors shrink-0 ml-2">
      {trailing ?? <ChevronRight className="w-4 h-4" />}
    </span>
  </button>
);

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Vendor Profile Screen — Figma node 542-561.
 *
 * Sections (top → bottom, per Figma):
 *  1. Header: back arrow + "Profile" title
 *  2. Avatar + businessName + "Verified Merchant" badge
 *  3. Stats row: Listings count (live) · Rating (static) · Earned (static)
 *  4. Vendor Mode toggle + "Go To Dashboard" CTA
 *  5. APP SETTINGS group: Security · Notifications · Help & Support
 *  6. Log Out button
 *  7. BUSINESS SETTINGS group: Business Details · Billing & Payments · Subscription Plan
 *
 * Data wiring:
 *  LIVE:  businessName, email, category, isVerified — GET /api/auth/profile (auth.routes.js:55)
 *  LIVE:  Listings count — derived from GET /api/routes filtered by createdBy (route.routes.js:19)
 *  STATIC: Rating, Earned, subscriptionStatus, isPremium, boostCredits
 *    // TODO: replace with real API response when GET /api/business/profile endpoint exists
 *    // Backend Business model has: isPremium, subscriptionStatus, boostCredits, trialEndDate
 *    // (BTBS-BACKEND/src/models/business.model.js:24-46) but no read endpoint is exposed
 *
 * Route guard: auth(el, "business") — business role only (/vendor/profile)
 */
const VendorProfile = () => {
  const navigate = useNavigate();
  const { session, clearSession } = useAuth();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ── Live: Profile data from GET /api/auth/profile ─────────────────────────
  // Endpoint: auth.routes.js:L55 → auth.controller.js:L227-L233 → returns req.user (User model)
  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: !!session?.token,
  });

  const businessName =
    profileData?.data?.businessName ||
    session?.user?.businessName ||
    session?.user?.fullName ||
    "Chidi Eze";

  const businessEmail =
    profileData?.data?.email ||
    session?.user?.email ||
    "";

  const businessCategory =
    profileData?.data?.category ||
    session?.user?.category ||
    "Business";

  const isVerified = profileData?.data?.isVerified ?? true;

  // ── Live: Route count filtered by this vendor ──────────────────────────────
  // Endpoint: GET /api/routes (route.routes.js:L19) → getAllRoutes → filter by createdBy
  const { data: allRoutes = [] } = useRoutes();
  const currentUserId = session?.user?._id || session?.user?.id;
  const myListingsCount = allRoutes.filter((r) => r.createdBy === currentUserId).length;

  // ── Static: Business subscription data ────────────────────────────────────
  // TODO: replace with real API response when GET /api/business/subscription endpoint exists
  // Business model fields: isPremium, subscriptionStatus ('trial'|'active'|'expired'), boostCredits, trialEndDate
  // (BTBS-BACKEND/src/models/business.model.js:24-46)
  const STATIC_SUBSCRIPTION = {
    plan: "Pro Tier Active",
    status: "active" as const,
  };

  // ── Static: Rating & Earnings ──────────────────────────────────────────────
  // TODO: replace with real API response when GET /api/business/metrics endpoint exists
  const STATIC_RATING = 4.8;
  const STATIC_EARNED = "₦6.5M";

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogout = () => {
    clearSession();
    navigate("/auth/vendor/login", { replace: true });
  };

  // Initials fallback for avatar
  const initials = businessName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col min-h-dvh bg-[#FDFCFA] text-[#1C1B1B]">
      {/* ── Navbar (untouched per core rules) ─────────────────────────── */}
      <BottomNavBar items={VENDOR_NAV_ITEMS} />

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <main
        id="vendor-profile-main"
        className="flex-1 w-full mx-auto pt-16"
        style={{ maxWidth: "min(100%, 68rem)" }}
        aria-label="Vendor profile content"
      >
        <div className="flex flex-col gap-5 px-4 sm:px-6 pt-4 pb-20">

          {/* 1 · Header ────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 py-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-1.5 -ml-1.5 rounded-lg text-[#1C1B1B] hover:bg-black/5 active:scale-95 transition-all"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-[#1C1B1B] m-0">
              Profile
            </h1>
          </div>

          {/* 2 · Avatar + Name + Verified Badge ─────────────────────── */}
          <section
            aria-labelledby="vendor-name-heading"
            className="flex flex-col items-center text-center gap-2 pt-1"
          >
            {/* Avatar */}
            <div className="relative mb-1">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#005047] border-[3px] border-white shadow-md flex items-center justify-center overflow-hidden">
                <span className="text-2xl sm:text-3xl font-bold text-white select-none">
                  {initials}
                </span>
              </div>
              {isVerified && (
                <span
                  className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full bg-[#00875A] border-2 border-white flex items-center justify-center shadow-sm"
                  aria-label="Verified merchant"
                >
                  <BadgeCheck className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </span>
              )}
            </div>

            <h2
              id="vendor-name-heading"
              className="text-xl sm:text-2xl font-bold text-[#1C1B1B] m-0 tracking-tight"
            >
              {businessName}
            </h2>

            {/* Verified Merchant pill — Figma: green bg, white text */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00875A] text-white text-xs font-semibold">
              <BadgeCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
              Verified Merchant
            </span>

            {/* Category + Email sub-labels */}
            {businessCategory && (
              <p className="text-xs text-[#747878] m-0 capitalize">{businessCategory}</p>
            )}
            {businessEmail && (
              <p className="text-xs text-[#A4A7A7] m-0">{businessEmail}</p>
            )}
          </section>

          {/* 3 · Stats Row: Listings · Rating · Earned ──────────────── */}
          {/* LIVE: myListingsCount  |  STATIC: rating, earned */}
          <section aria-label="Business statistics">
            <div className="grid grid-cols-3 bg-[#F4F1EE] rounded-2xl p-4 sm:p-5 border border-black/5 shadow-sm text-center">
              {/* Listings — LIVE */}
              <div className="flex flex-col items-center justify-center border-r border-black/8 pr-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#1C1B1B]">
                  {myListingsCount}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#747878] uppercase tracking-wider mt-0.5">
                  Listings
                </span>
              </div>

              {/* Rating — STATIC */}
              {/* TODO: replace with real rating when GET /api/business/metrics exists */}
              <div className="flex flex-col items-center justify-center border-r border-black/8 px-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#1C1B1B] flex items-baseline gap-0.5">
                  {STATIC_RATING}
                  <Star className="w-4 h-4 text-[#FFC72C] fill-[#FFC72C] mb-0.5" />
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#747878] uppercase tracking-wider mt-0.5">
                  Rating
                </span>
              </div>

              {/* Earned — STATIC */}
              {/* TODO: replace with real earnings when GET /api/business/earnings exists */}
              <div className="flex flex-col items-center justify-center pl-2">
                <span className="text-xl sm:text-2xl font-extrabold text-[#946A00]">
                  {STATIC_EARNED}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#946A00] uppercase tracking-wider mt-0.5">
                  Earned
                </span>
              </div>
            </div>
          </section>

          {/* 4 · Vendor Mode Toggle + Go To Dashboard ────────────────── */}
          <section className="bg-white rounded-2xl border border-black/6 shadow-sm overflow-hidden divide-y divide-black/5">
            {/* Vendor Mode toggle */}
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1C1B1B] flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1C1B1B] m-0">Vendor Mode</p>
                  <p className="text-xs text-[#747878] m-0 mt-0.5">Switch to Consumer Mode</p>
                </div>
              </div>
              {/* Toggle — currently always ON for business accounts */}
              <button
                type="button"
                id="vendor-mode-toggle"
                aria-label="Vendor mode is active"
                className="w-12 h-6 rounded-full bg-[#1C1B1B] flex items-center px-0.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005047]"
                onClick={() => showToast("Switch to consumer mode is not yet supported.")}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-sm ml-auto transition-all" />
              </button>
            </div>

            {/* Go To Dashboard — yellow CTA */}
            <div className="px-4 py-3.5">
              <button
                type="button"
                id="go-to-dashboard-btn"
                onClick={() => navigate("/vendor/home")}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#FFC72C] hover:bg-[#F0B81E] active:scale-[0.99] text-[#1C1B1B] font-bold text-sm transition-all"
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Go To Dashboard
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* 5 · APP SETTINGS ────────────────────────────────────────── */}
          <section aria-label="App settings">
            <SettingsGroupLabel>App Settings</SettingsGroupLabel>
            <div className="bg-white rounded-2xl border border-black/6 shadow-sm overflow-hidden divide-y divide-black/5 mt-2">
              <MenuRow
                id="menu-security"
                icon={<Shield className="w-5 h-5" />}
                title="Security"
                subtitle="Password and account security"
                onClick={() => setActiveModal("Security")}
              />
              <MenuRow
                id="menu-notifications"
                icon={<Bell className="w-5 h-5" />}
                title="Notifications"
                subtitle="Alerts for listings and orders"
                onClick={() => setActiveModal("Notifications")}
              />
              <MenuRow
                id="menu-help"
                icon={<HelpCircle className="w-5 h-5" />}
                title="Help & Support"
                subtitle="FAQs and contact us"
                onClick={() => setActiveModal("Help & Support")}
              />
            </div>
          </section>

          {/* 6 · Log Out ─────────────────────────────────────────────── */}
          <section aria-label="Log out">
            <button
              type="button"
              id="logout-btn"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-[#FEF2F2] border border-[#E05252]/20 text-[#D32F2F] font-semibold text-sm hover:bg-[#FEECEC] active:scale-[0.99] transition-all shadow-sm"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span>Log Out</span>
            </button>
          </section>

          {/* 7 · BUSINESS SETTINGS ───────────────────────────────────── */}
          <section aria-label="Business settings">
            <SettingsGroupLabel>Business Settings</SettingsGroupLabel>
            <div className="rounded-2xl overflow-hidden divide-y divide-[#FFC72C]/30 mt-2">

              {/* Business Details */}
              <MenuRow
                id="menu-business-details"
                iconBg="bg-[#FFF4D6]"
                icon={<Store className="w-5 h-5 text-[#6F5400]" />}
                title="Business Details"
                subtitle="Manage address, categories, etc."
                onClick={() => setActiveModal("Business Details")}
              />

              {/* Billing & Payments */}
              <MenuRow
                id="menu-billing"
                iconBg="bg-[#FFF4D6]"
                icon={<CreditCard className="w-5 h-5 text-[#6F5400]" />}
                title="Billing & Payments"
                subtitle="Paystack account, history"
                onClick={() => navigate("/vendor/upgrade")}
              />

              {/* Subscription Plan */}
              {/* STATIC: subscriptionStatus from Business model — no read endpoint yet */}
              {/* TODO: replace with real subscription status from GET /api/business/subscription */}
              <div className="flex items-center justify-between px-4 py-3.5 bg-white hover:bg-[#FFFBF0] transition-colors group">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF4D6] flex items-center justify-center shrink-0">
                    <BadgeCheck className="w-5 h-5 text-[#6F5400]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1C1B1B] m-0">Subscription Plan</p>
                    <p className="text-xs text-[#747878] m-0 mt-0.5">{STATIC_SUBSCRIPTION.plan}</p>
                  </div>
                </div>
                <button
                  type="button"
                  id="manage-subscription-btn"
                  onClick={() => navigate("/vendor/upgrade")}
                  className="px-3 py-1 rounded-lg bg-[#FFC72C] text-[#1C1B1B] text-xs font-bold hover:bg-[#F0B81E] active:scale-95 transition-all shrink-0"
                >
                  MANAGE
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ── Lightweight modal stub for non-data settings items ─────── */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="vendor-profile-modal-title"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-black/10 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="vendor-profile-modal-title"
              className="text-lg font-bold text-[#1C1B1B] m-0"
            >
              {activeModal}
            </h3>
            <p className="text-sm text-[#444748] m-0">
              This section is ready to be wired to a live settings service when the backend configuration endpoint is available.
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

      {/* ── Toast ──────────────────────────────────────────────────── */}
      <Toast message={toastMsg} />
    </div>
  );
};

export default VendorProfile;
