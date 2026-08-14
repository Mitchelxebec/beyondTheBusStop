import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNavBar, PrimaryButton, SecondaryButton } from "../../components";
import { VENDOR_NAV_ITEMS } from "./VendorRoutes";
import { useAuth } from "../../contexts/AuthContext";

// ─── Icons ──────────────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="8" stroke="#005047" strokeWidth="1.6" fill="#79F7E3" fillOpacity="0.2" />
    <path d="M6.5 10L9 12.5L13.5 7.5" stroke="#005047" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M12.5 15L7.5 10L12.5 5" stroke="#1C1B1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 2L11.8 7.2L17 9L11.8 10.8L10 16L8.2 10.8L3 9L8.2 7.2L10 2Z" fill="#FFC72C" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <rect x="3.5" y="7" width="11" height="8.5" rx="2" stroke="#747878" strokeWidth="1.5" />
    <path d="M6 7V5C6 3.34 7.34 2 9 2C10.66 2 12 3.34 12 5V7" stroke="#747878" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Vendor Upgrade / Subscription Page
 *
 * Reached by clicking "Renew" or any locked feature (Boost Listing, Payments, Analytics).
 *
 * // TODO: replace with real payment / subscription gateway endpoint when ready (POST /api/business/subscribe)
 */
const VendorUpgrade = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const businessName =
    session?.user?.businessName ||
    session?.user?.fullName ||
    (session?.user?.email ? session.user.email.split("@")[0] : "Business Owner");

  const handleSubscribe = () => {
    setIsProcessing(true);
    // TODO: replace with real payment gateway (Paystack/Flutterwave/Stripe) checkout integration
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessMsg("Subscription activated! Unlocked Boost Listing, Payments, and Analytics.");
      setTimeout(() => {
        navigate("/vendor/home");
      }, 1800);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#FDFAF8]">
      <BottomNavBar items={VENDOR_NAV_ITEMS} />

      <main
        id="vendor-upgrade-main"
        className="flex-1 w-full mx-auto pt-16"
        style={{ maxWidth: "min(100%, 42rem)" }}
        aria-label="Vendor Upgrade & Plans"
      >
        <div className="flex flex-col gap-6 px-4 sm:px-6 pt-6 pb-16">
          {/* Top Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/vendor/home")}
              className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors"
              aria-label="Go back to Business Portal"
            >
              <ArrowLeftIcon />
            </button>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#59DBC7]">
                Business Subscription
              </span>
              <h1 className="text-xl font-bold text-[#1C1B1B] m-0">Upgrade Business Portal</h1>
            </div>
          </div>

          {/* Account Status Card with active Auth Session */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-100 shadow-xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-[#747878] font-medium">Upgrading Plan For</span>
              <span className="text-sm sm:text-base font-bold text-[#1C1B1B]">{businessName}</span>
              {session?.user?.email && (
                <span className="text-xs text-[#747878]">{session.user.email}</span>
              )}
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF4D6] text-[#6F5400] border border-[#FFC72C]/40">
              Free Tier (Active)
            </span>
          </div>

          {/* Intro Card */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-xs flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[#1C1B1B] m-0">
              Grow Your Business at High-Traffic Transit Stops
            </h2>
            <p className="text-xs text-[#444748] m-0 leading-relaxed">
              Unlock powerful tools to boost your listings to daily commuters, access traffic analytics, and manage automated billing.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-2 bg-[#F4F1EE] p-1 rounded-xl max-w-xs mx-auto w-full">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                billingCycle === "monthly"
                  ? "bg-white text-[#1C1B1B] shadow-xs"
                  : "text-[#747878] hover:text-[#1C1B1B]"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                billingCycle === "yearly"
                  ? "bg-[#005047] text-white shadow-xs"
                  : "text-[#747878] hover:text-[#1C1B1B]"
              }`}
            >
              <span>Annual</span>
              <span className="text-[9px] bg-[#FFC72C] text-[#6F5400] px-1.5 py-0.2 rounded-full font-extrabold">
                -25%
              </span>
            </button>
          </div>

          {/* Pricing Plans Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Free Starter (Current) */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase text-[#747878]">Free Starter</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#1C1B1B]">₦0</span>
                  <span className="text-xs text-[#747878]">/ forever</span>
                </div>
                <p className="text-xs text-[#747878]">Standard organic business presence at transit stops.</p>

                <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-neutral-100">
                  <div className="flex items-center gap-2 text-xs text-[#1C1B1B]">
                    <CheckIcon />
                    <span>Create Listing (Free & Unlimited)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#747878]">
                    <LockIcon />
                    <span className="line-through">Boost Listing</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#747878]">
                    <LockIcon />
                    <span className="line-through">Payments & Invoicing</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#747878]">
                    <LockIcon />
                    <span className="line-through">Traffic Analytics</span>
                  </div>
                </div>
              </div>

              <span className="text-center text-xs font-bold text-[#747878] py-2 bg-neutral-100 rounded-xl">
                Current Plan
              </span>
            </div>

            {/* Pro Merchant (Recommended) */}
            <div className="relative bg-gradient-to-b from-[#005047]/5 to-[#79F7E3]/15 rounded-2xl p-5 border-2 border-[#005047] flex flex-col justify-between gap-4 shadow-sm">
              <div className="absolute -top-3 right-4 bg-[#005047] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <SparklesIcon /> Recommended
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase text-[#005047]">Pro Business</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#1C1B1B]">
                    {billingCycle === "yearly" ? "₦135,000" : "₦15,000"}
                  </span>
                  <span className="text-xs text-[#444748]">
                    {billingCycle === "yearly" ? "/ year" : "/ month"}
                  </span>
                </div>
                <p className="text-xs text-[#444748]">Full access to all promotional & analytics power tools.</p>

                <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-[#005047]/20">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#1C1B1B]">
                    <CheckIcon />
                    <span>Create Listing (Free & Always Unlocked)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#005047]">
                    <CheckIcon />
                    <span>⚡ Boost Listing (3x Priority Placement)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#005047]">
                    <CheckIcon />
                    <span>💳 Payments & Automated Invoicing</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#005047]">
                    <CheckIcon />
                    <span>📊 Full Commuter Traffic Analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#005047]">
                    <CheckIcon />
                    <span>10 Monthly Free Boost Credits</span>
                  </div>
                </div>
              </div>

              <PrimaryButton
                id="confirm-upgrade-btn"
                onClick={handleSubscribe}
                disabled={isProcessing}
                width="full"
              >
                {isProcessing ? "Activating..." : "Upgrade Now"}
              </PrimaryButton>
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-4 rounded-xl bg-[#79F7E3]/30 border border-[#005047]/30 text-[#005047] text-xs font-bold text-center animate-in fade-in">
              {successMsg}
            </div>
          )}

          <div className="flex justify-center">
            <SecondaryButton onClick={() => navigate("/vendor/home")} width="auto">
              Return to Business Portal
            </SecondaryButton>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorUpgrade;
