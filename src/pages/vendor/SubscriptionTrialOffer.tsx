import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { BottomNavBar, Toast, VENDOR_NAV_ITEMS } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import { openPaystackCheckout, verifyPayment, PLAN_PRICES } from "../../services/payment";

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Returns today + n days as "Mon DD" e.g. "Aug 18" */
function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TRIAL_DAYS = 7;
const trialStart = addDays(0);
const trialEnd   = addDays(TRIAL_DAYS);
const firstPayment = addDays(TRIAL_DAYS + 1);

const FEATURES = [
  "Create and promote business listings",
  "Reach commuters near busy transport routes",
  "Access listing performance insights",
  "Manage and renew promotions",
];

// ─── Page ──────────────────────────────────────────────────────────────────────

/**
 * SubscriptionTrialOffer — /vendor/subscription/trial
 *
 * Presents the 7-day free trial offer for the Pro Business plan.
 * On CTA, opens Paystack popup (card collected now, charged after trial).
 * POST /api/business/payment/initialize  →  POST /api/business/payment/verify
 *
 * TODO: Once GET /api/business/subscription is live, read trialEndDate from there
 *       instead of computing client-side dates.
 */
const SubscriptionTrialOffer = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleStartTrial = async () => {
    if (!session?.user?.email) {
      showToast("Could not find your account email. Please log in again.");
      return;
    }

    setIsProcessing(true);

    await openPaystackCheckout({
      email: session.user.email,
      plan: "monthly",

      onSuccess: async (reference) => {
        try {
          await verifyPayment(reference);
        } catch {
          console.info("[BTBS] Trial payment reference for backend verification:", reference);
        }
        showToast("Your 7-day free trial has started! You won't be charged until " + firstPayment + ".");
        setIsProcessing(false);
        setTimeout(() => navigate("/vendor/subscription"), 2000);
      },

      onCancel: () => {
        setIsProcessing(false);
        showToast("Cancelled. Your trial has not started.");
      },

      onError: (err) => {
        setIsProcessing(false);
        showToast(err.message || "Could not start checkout. Please try again.");
      },
    });
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F0]">
      <BottomNavBar items={VENDOR_NAV_ITEMS} />

      <main
        className="flex-1 w-full mx-auto pt-16"
        style={{ maxWidth: "min(100%, 68rem)" }}
        aria-label="Subscription trial offer"
      >
        <div className="flex flex-col gap-5 px-4 sm:px-6 pt-4 pb-28">

          {/* Header */}
          <div className="flex items-center gap-3 py-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-1.5 -ml-1.5 rounded-lg text-[#1C1B1B] hover:bg-black/5 active:scale-95 transition-all"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#59DBC7]">
                Business Subscription
              </span>
              <h1 className="text-base font-bold text-[#1C1B1B] m-0">Subscription Plans</h1>
            </div>
          </div>

          {/* Trial badge + hero copy */}
          <div className="flex flex-col items-center text-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FFF4D6] text-[#6F5400] text-xs font-bold border border-[#FFC72C]/40">
              <Star className="w-3.5 h-3.5 fill-[#FFC72C] text-[#FFC72C]" />
              First {TRIAL_DAYS} days FREE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1C1B1B] tracking-tight m-0">
              Elevate Your Business
            </h2>
            <p className="text-sm text-[#747878] leading-relaxed max-w-xs m-0">
              Try our Pro Business plan and reach thousands of daily commuters across Lagos.
            </p>
          </div>

          {/* Subscription card */}
          <section
            aria-labelledby="trial-plan-heading"
            className="bg-white rounded-2xl border-t-4 border-[#00C9A7] shadow-sm overflow-hidden"
          >
            {/* Plan name + price */}
            <div className="px-5 pt-5 pb-4 border-b border-neutral-100">
              <h3
                id="trial-plan-heading"
                className="text-sm font-bold text-[#1C1B1B] m-0"
              >
                Pro Business Plan
              </h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-[#1C1B1B]">
                  {PLAN_PRICES.monthly.label.split(" / ")[0]}
                </span>
                <span className="text-xs text-[#747878]">/ month after trial</span>
              </div>
            </div>

            {/* Trial dates */}
            <div className="mx-5 my-4 bg-[#00C9A7] rounded-xl px-4 py-3.5 flex flex-col gap-2.5">
              {[
                { label: "Trial Start",    value: `Today, ${trialStart}` },
                { label: "Trial Ends",     value: trialEnd },
                { label: "First Payment",  value: firstPayment },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-[#005047] font-medium">{label}</span>
                  <span className="text-xs font-bold text-[#1C1B1B]">{value}</span>
                </div>
              ))}
            </div>

            {/* What's included */}
            <div className="px-5 pb-5 flex flex-col gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#747878]">
                What's Included
              </span>
              <ul className="flex flex-col gap-2.5" role="list">
                {FEATURES.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#00C9A7] flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-xs text-[#444748] leading-relaxed">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Disclaimer */}
          <p className="text-xs text-[#A4A7A7] text-center leading-relaxed px-2">
            You won't be charged during your {TRIAL_DAYS}-day trial. Your monthly subscription
            begins on {firstPayment} unless you cancel before the trial ends.
          </p>

        </div>
      </main>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 px-4 py-4 flex flex-col gap-2 z-30">
        <button
          type="button"
          onClick={handleStartTrial}
          disabled={isProcessing}
          className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#FFC72C] text-[#1C1B1B] text-sm font-bold hover:bg-[#F0B81E] active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Starting…" : `Start ${TRIAL_DAYS}-Day Free Trial →`}
        </button>
        <p className="text-[10px] text-center text-[#A4A7A7]">
          Cancel anytime before {trialEnd} — no charge.
        </p>
      </div>

      <Toast message={toastMsg} />
    </div>
  );
};

export default SubscriptionTrialOffer;
