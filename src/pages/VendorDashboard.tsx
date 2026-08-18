import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  BottomNavBar,
  PrimaryButton,
  SecondaryButton,
  TextInput,
  Toast,
  VENDOR_NAV_ITEMS,
} from "../components";
import { useAuth } from "../contexts/AuthContext";
import { getProfile } from "../services/auth";

// ─── Exact Figma Icons ─────────────────────────────────────────────────────────

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1C1B1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const EyeTealIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const TrendingUpGreenIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const StarGoldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#F8BA2A" stroke="#F8BA2A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const MessageSquareIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#747878" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const StorefrontFilledIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1C1B1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const RocketTealIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const BanknoteIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#444748" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

const AnalyticsLineChartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#444748" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const RefreshCycleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#444748" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const CookingPotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#504538" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12h20" />
    <path d="M20 12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6" />
    <path d="M4 8l1.5-3.5A2 2 0 0 1 7.34 3h9.32a2 2 0 0 1 1.84 1.5L20 8" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M5 5L15 15M5 15L15 5" stroke="#444748" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);



// ─── Component ─────────────────────────────────────────────────────────────────

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  // ── Backend Cross-Reference: Wire live authenticated profile data ────────────
  // Backend file: BTBS-BACKEND/src/controllers/auth.controller.js (lines 227-233)
  // Backend endpoint: GET /api/auth/profile -> returns { success: true, data: req.user }
  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: !!session?.token,
  });

  // Dynamic businessName & category from backend User model (BTBS-BACKEND/src/models/user.model.js)
  const businessName =
    profileData?.data?.businessName ||
    session?.user?.businessName ||
    session?.user?.fullName ||
    (session?.user?.email ? session.user.email.split("@")[0] : "Mama Joy's Kitchen");

  const businessCategory =
    profileData?.data?.category ||
    session?.user?.category ||
    "business";

  const greetingTime = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning,";
    if (h < 17) return "Good afternoon,";
    return "Good evening,";
  })();

  // ─── Free Feature State (Create Listing is always unlocked & free) ───────────
  const [showCreateListingModal, setShowCreateListingModal] = useState(false);
  const [newListing, setNewListing] = useState({
    title: "",
    targetStop: "",
    offer: "",
    category: "Food & Drinks",
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateListingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListing.title.trim() || !newListing.targetStop.trim()) return;

    // TODO: replace with real API response when create listing endpoint exists (POST /api/business/listings)
    setShowCreateListingModal(false);
    setNewListing({ title: "", targetStop: "", offer: "", category: "Food & Drinks" });
    showToast("Promotional listing published successfully!");
  };

  // ─── Locked State Actions ───────────────────────────────────────────────────
  // TODO: replace with real subscriptionStatus check when the endpoint exists (GET /api/business/subscription)
  // Cross-reference: BTBS-BACKEND/src/models/business.model.js tracks subscriptionStatus ('trial' | 'active' | 'expired')
  const handleLockedAction = (_featureName?: string) => {
    navigate("/vendor/upgrade");
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F0]">
      {/* ── Navbar ───────────────────────────────────────────────────── */}
      <BottomNavBar items={VENDOR_NAV_ITEMS} />

      {/* ── Main Container (Fully responsive: mobile 375px, tablet sm/md, desktop lg/xl) ── */}
      <main
        id="vendor-home-main"
        className="flex-1 w-full mx-auto pt-16"
        style={{ maxWidth: "min(100%, 68rem)" }}
        aria-label="Business Portal Content"
      >
        <div className="flex flex-col gap-5 sm:gap-6 px-4 sm:px-6 pt-4 sm:pt-6 pb-16">

          {/* ── 1. Header Navigation Bar (Figma Title Bar) ─────────────── */}
          <div className="flex items-center gap-3 py-1">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 -ml-1.5 rounded-lg text-[#1C1B1B] hover:bg-black/5 active:scale-95 transition-all"
              aria-label="Go back"
            >
              <ArrowLeftIcon />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-[#1C1B1B] m-0">
              Business Portal
            </h1>
          </div>

          {/* ── 2. Greeting & Store Avatar (Figma Hero) ───────────────── */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs sm:text-sm text-[#747878] font-normal">
                {greetingTime}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1C1B1B] m-0 tracking-tight truncate">
                {businessName}
              </h2>
            </div>

            {/* Circular Store Avatar with Green Online Dot */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#EBEAE6] border border-black/5 shadow-xs flex items-center justify-center">
                <CookingPotIcon />
              </div>
              <span
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#00C9A7] border-2 border-white absolute bottom-0 right-0"
                title="Active Storefront"
              />
            </div>
          </div>

          {/* ── 3. Top Metrics Cards Grid (Figma: Total Views & Listing Rating) ── */}
          {/* TODO: replace with real API response when metrics endpoint exists (GET /api/business/metrics) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Total Views Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-1.5">
                <EyeTealIcon />
                <span className="text-[10px] sm:text-xs font-bold tracking-wider text-[#444748] uppercase">
                  TOTAL VIEWS
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-bold text-[#1C1B1B] tracking-tight">
                  4,821
                </span>
                <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#00C9A7] mt-0.5">
                  <TrendingUpGreenIcon />
                  <span>+12% this week</span>
                </div>
              </div>
            </div>

            {/* Listing Rating Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-1.5">
                <StarGoldIcon />
                <span className="text-[10px] sm:text-xs font-bold tracking-wider text-[#444748] uppercase">
                  LISTING RATING
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-[#1C1B1B] tracking-tight">
                    4.8
                  </span>
                  <span className="text-xs sm:text-sm text-[#747878] font-normal">/ 5.0</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] sm:text-xs text-[#747878] font-normal mt-0.5">
                  <MessageSquareIcon />
                  <span>From 142 reviews</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 4. Quick Actions Section (Figma: Exact 2-Row Layout & Colors) ── */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm sm:text-base font-bold text-[#1C1B1B] m-0">
              Quick Actions
            </h3>

            {/* Row 1: Two Large Prominent Feature Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Create Listing (Brand Gold/Yellow Card — Free & Unlocked) */}
              {/* TODO: replace with real API response when create listing endpoint exists (POST /api/business/listings) */}
              <button
                id="create-listing-btn"
                type="button"
                onClick={() => navigate("/vendor/create-listing")}
                className="bg-[#F8BA2A] hover:bg-[#EEB020] active:scale-[0.98] rounded-2xl p-4 sm:p-5 flex flex-col justify-between h-28 sm:h-34 text-left shadow-xs transition-all cursor-pointer group"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <StorefrontFilledIcon />
                </div>
                <span className="text-sm sm:text-base font-bold text-[#1C1B1B] tracking-tight">
                  Create Listing
                </span>
              </button>

              {/* Boost Listing (Deep Dark Teal Gradient Card — Rocket Icon) */}
              {/* TODO: replace with real subscriptionStatus check when endpoint exists (POST /api/business/listings/:id/boost) */}
              <button
                id="boost-listing-btn"
                type="button"
                onClick={() => handleLockedAction("Boost Listing")}
                className="relative overflow-hidden bg-linear-to-br from-[#02241F] via-[#03302A] to-[#043B33] hover:brightness-110 active:scale-[0.98] rounded-2xl p-4 sm:p-5 flex flex-col justify-between h-28 sm:h-34 text-left shadow-xs transition-all cursor-pointer group"
              >
                {/* Subtle soft glowing accent */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#00C9A7]/20 blur-xl pointer-events-none" />

                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#00C9A7]/20 border border-[#00C9A7]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <RocketTealIcon />
                </div>
                <span className="text-sm sm:text-base font-bold text-[#00C9A7] tracking-tight">
                  Boost Listing
                </span>
              </button>
            </div>

            {/* Row 2: Three Equal Action Buttons (Payments, Analytics, Renew) */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
              {/* Payments */}
              {/* TODO: replace with real subscription/payments endpoint when ready (GET /api/business/payments) */}
              <button
                id="payments-btn"
                type="button"
                onClick={() => handleLockedAction("Payments")}
                className="bg-[#EBEAE6] hover:bg-[#E2E1DC] active:scale-[0.98] rounded-2xl py-3.5 sm:py-4 px-2 flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-center transition-colors cursor-pointer"
              >
                <BanknoteIcon />
                <span className="text-xs sm:text-sm font-semibold text-[#1C1B1B]">
                  Payments
                </span>
              </button>

              {/* Analytics */}
              {/* TODO: replace with real analytics endpoint when ready (GET /api/business/analytics) */}
              <button
                id="analytics-btn"
                type="button"
                onClick={() => navigate("/vendor/analytics")}
                className="bg-[#EBEAE6] hover:bg-[#E2E1DC] active:scale-[0.98] rounded-2xl py-3.5 sm:py-4 px-2 flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-center transition-colors cursor-pointer"
              >
                <AnalyticsLineChartIcon />
                <span className="text-xs sm:text-sm font-semibold text-[#1C1B1B]">
                  Analytics
                </span>
              </button>

              {/* Renew */}
              {/* TODO: replace with real subscription renewal endpoint when ready (POST /api/business/subscription/renew) */}
              <button
                id="renew-btn"
                type="button"
                onClick={() => handleLockedAction("Renew")}
                className="bg-[#EBEAE6] hover:bg-[#E2E1DC] active:scale-[0.98] rounded-2xl py-3.5 sm:py-4 px-2 flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-center transition-colors cursor-pointer"
              >
                <RefreshCycleIcon />
                <span className="text-xs sm:text-sm font-semibold text-[#1C1B1B]">
                  Renew
                </span>
              </button>
            </div>
          </section>

          {/* ── 5. Performance Snapshot (Figma: Exactly at the Bottom with Progress Bars) ── */}
          {/* TODO: replace with real API response when performance snapshot endpoint exists (GET /api/business/performance) */}
          <section className="bg-[#EBEAE6]/65 rounded-3xl p-4 sm:p-5 border border-black/5 flex flex-col gap-4 shadow-xs mt-1">
            {/* Header: Title + ACTIVE Pill Badge */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-[#1C1B1B] m-0">
                Performance Snapshot
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D2F4EB] text-[#005047] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C9A7]" />
                ACTIVE
              </span>
            </div>

            {/* Subtext */}
            <p className="text-xs sm:text-sm text-[#747878] m-0 -mt-2 leading-relaxed">
              Compared to other {businessCategory} vendors near Oshodi Terminal.
            </p>

            {/* Metric 1: Click-through Rate */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-[#1C1B1B]">Click-through Rate</span>
                <span className="font-bold text-[#00C9A7]">8.4%</span>
              </div>
              <div className="w-full bg-[#DCDAD5] h-2 sm:h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#00C9A7] h-full rounded-full transition-all duration-500"
                  style={{ width: "65%" }}
                />
              </div>
              <span className="text-[10px] sm:text-xs text-[#747878]">Market Avg: 5.2%</span>
            </div>

            {/* Metric 2: Conversion to Directions */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-[#1C1B1B]">Conversion to Directions</span>
                <span className="font-bold text-[#F8BA2A]">12.1%</span>
              </div>
              <div className="w-full bg-[#DCDAD5] h-2 sm:h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#F8BA2A] h-full rounded-full transition-all duration-500"
                  style={{ width: "80%" }}
                />
              </div>
              <span className="text-[10px] sm:text-xs text-[#747878]">Market Avg: 9.8%</span>
            </div>
          </section>

        </div>
      </main>

      {/* ── Create Listing Modal (Free for all vendors) ─────────────── */}
      {showCreateListingModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-[#1C1B1B] m-0">Create Promotional Listing</h2>
                <p className="text-xs text-[#747878] m-0">Free promotion for transit commuters</p>
              </div>
              <button
                onClick={() => setShowCreateListingModal(false)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-[#444748] transition-colors"
                aria-label="Close modal"
              >
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleCreateListingSubmit} className="flex flex-col gap-4">
              <TextInput
                label="Offer Headline / Promotion Title"
                placeholder="e.g. 20% Off All Cold Drinks & Pastries"
                value={newListing.title}
                onChange={(e) => setNewListing((prev) => ({ ...prev, title: e.target.value }))}
                required
              />

              <TextInput
                label="Target Bus Stop / Terminal"
                placeholder="e.g. Ojota Bus Terminus, CMS, Ikeja"
                value={newListing.targetStop}
                onChange={(e) => setNewListing((prev) => ({ ...prev, targetStop: e.target.value }))}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <TextInput
                  label="Discount / Offer Tag"
                  placeholder="e.g. 20% OFF"
                  value={newListing.offer}
                  onChange={(e) => setNewListing((prev) => ({ ...prev, offer: e.target.value }))}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 px-1">Category</label>
                  <select
                    value={newListing.category}
                    onChange={(e) => setNewListing((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full h-11 bg-gray-50 rounded-lg px-3 text-sm text-gray-900 border border-gray-200 outline-none"
                  >
                    <option value="Food & Drinks">Food & Drinks</option>
                    <option value="Electronics & Repairs">Electronics & Repairs</option>
                    <option value="Fashion & Retail">Fashion & Retail</option>
                    <option value="Health & Beauty">Health & Beauty</option>
                    <option value="Services & Logistics">Services & Logistics</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <SecondaryButton onClick={() => setShowCreateListingModal(false)} width="auto">
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" width="auto">
                  Publish Listing
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast Notification ───────────────────────────────────────── */}
      <Toast message={toastMessage} />
    </div>
  );
};

export default VendorDashboard;
