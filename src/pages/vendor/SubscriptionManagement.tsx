import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Settings, XCircle } from "lucide-react";
import { BottomNavBar, Toast, VENDOR_NAV_ITEMS } from "../../components";

/**
 * SubscriptionManagement Page
 *
 * Shows the vendor's current subscription status, billing info, and payment method.
 * TODO: replace all static data with GET /api/business/subscription when the endpoint is ready.
 */
const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleManageSubscription = () => {
    navigate("/vendor/upgrade");
  };

  const handleCancelSubscription = () => {
    // TODO: wire to DELETE /api/business/subscription when endpoint is ready
    showToast("Cancellation request received. You'll receive a confirmation email shortly.");
  };

  const handleContactSupport = () => {
    // TODO: wire to support channel or open intercom widget
    showToast("Opening support... Our team is available 24/7 to help you.");
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F0]">
      <BottomNavBar items={VENDOR_NAV_ITEMS} />

      <main
        className="flex-1 w-full mx-auto pt-16"
        style={{ maxWidth: "min(100%, 68rem)" }}
        aria-label="Subscription management"
      >
        <div className="flex flex-col gap-5 px-4 sm:px-6 pt-4 pb-20">

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
            <h1 className="text-base font-bold text-[#1C1B1B] m-0">Subscription Management</h1>
          </div>

          {/* Subscription Card */}
          {/* TODO: replace static values with GET /api/business/subscription response */}
          <section
            aria-labelledby="subscription-heading"
            className="bg-[#00C9A7] rounded-2xl p-5 flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="subscription-heading"
                  className="text-sm font-bold text-white m-0"
                >
                  Basic Subscription
                </h2>
                <p className="text-xs text-[#005047] font-semibold m-0 mt-0.5">
                  ♦ Business Portal
                </p>
              </div>
              <span className="flex items-center gap-1.5 bg-[#FFC72C] text-[#1C1B1B] text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C1B1B] animate-pulse" />
                Trial: 5 days left
              </span>
            </div>

            <div className="h-px bg-white/20" />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#005047]">
                  Next Billing
                </span>
                <span className="text-sm font-bold text-white">Oct 24, 2023</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#005047]">
                  Monthly Price
                </span>
                <span className="text-sm font-bold text-white">₦5,000/mo</span>
              </div>
            </div>
          </section>

          {/* Payment Method */}
          {/* TODO: replace with GET /api/business/payment-method */}
          <section
            aria-labelledby="payment-method-heading"
            className="bg-white rounded-2xl p-5 border border-black/5 shadow-xs flex flex-col gap-4"
          >
            <h2
              id="payment-method-heading"
              className="text-sm font-bold text-[#1C1B1B] m-0"
            >
              Payment Method
            </h2>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F4F1EE] border border-black/5">
              <div className="w-10 h-10 rounded-lg bg-[#1C1B1B] flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-bold text-[#1C1B1B]">•••• 1234</span>
                <span className="text-xs text-[#747878]">Expires 12/25</span>
              </div>
              <button
                type="button"
                onClick={() => showToast("Card management coming soon.")}
                className="p-2 rounded-lg text-[#747878] hover:bg-black/5 hover:text-[#1C1B1B] transition-all active:scale-95"
                aria-label="Edit payment method"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Actions */}
          <section className="flex flex-col gap-3" aria-label="Subscription actions">
            <button
              type="button"
              onClick={handleManageSubscription}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#FFC72C] text-[#1C1B1B] text-sm font-bold hover:bg-[#F0B81E] active:scale-[0.98] transition-all shadow-sm"
            >
              <Settings className="w-4 h-4" />
              Manage Subscription
            </button>

            <button
              type="button"
              onClick={handleCancelSubscription}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-[#BA1A1A]/30 bg-[#FCE8E6] text-[#BA1A1A] text-sm font-bold hover:bg-[#BA1A1A]/10 active:scale-[0.98] transition-all"
            >
              <XCircle className="w-4 h-4" />
              Cancel Subscription
            </button>
          </section>

          {/* Help Card */}
          <section
            aria-labelledby="help-heading"
            className="bg-white rounded-2xl p-6 border border-black/5 shadow-xs flex flex-col items-center gap-3 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-[#F4F1EE] flex items-center justify-center">
              <span className="text-xl">🙋</span>
            </div>
            <div>
              <h3
                id="help-heading"
                className="text-sm font-bold text-[#1C1B1B] m-0"
              >
                Need help?
              </h3>
              <p className="text-xs text-[#747878] mt-1 leading-relaxed">
                Our support team is available 24/7 to assist with billing inquiries.
              </p>
            </div>
            <button
              type="button"
              onClick={handleContactSupport}
              className="text-sm font-bold text-[#00C9A7] hover:underline transition-colors"
            >
              Contact Support →
            </button>
          </section>

        </div>
      </main>

      <Toast message={toastMsg} />
    </div>
  );
};

export default SubscriptionManagement;
