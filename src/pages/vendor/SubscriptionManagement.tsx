import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  CreditCard,
  RefreshCw,
  XCircle,
  Sparkles,
  HelpCircle,
  ChevronRight,
  BadgeCheck,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { BottomNavBar, Toast, VENDOR_NAV_ITEMS } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../lib/axios";
import type { BillingCycle } from "../../services/payment";

// ─── Backend contract ──────────────────────────────────────────────────────────
// GET /api/business/subscription
// Response shape:
// {
//   success: boolean;
//   subscription: {
//     plan: string;                              // "pro_business" | "free"
//     billingCycle: "monthly" | "yearly";
//     status: "trial" | "active" | "expired";
//     trialEndsAt: string | null;               // ISO 8601
//     nextBillingDate: string | null;           // ISO 8601
//     monthlyPrice: number;                     // in NGN (not kobo)
//     paymentMethod: {
//       type: "card";
//       last4: string;
//       expiry: string;                         // "MM/YY"
//     } | null;
//   } | null;
// }
//
// DELETE /api/business/subscription
// Response: { success: boolean; message: string }

interface PaymentMethod {
  type: "card";
  last4: string;
  expiry: string;
}

interface Subscription {
  plan: string;
  billingCycle: BillingCycle;
  status: "trial" | "active" | "expired";
  trialEndsAt: string | null;
  nextBillingDate: string | null;
  monthlyPrice: number;
  paymentMethod: PaymentMethod | null;
}

interface SubscriptionResponse {
  success: boolean;
  subscription: Subscription | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(iso: string | null | undefined): number {
  if (!iso) return 0;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatNGN(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

// ─── Status badge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: Subscription["status"] }) => {
  const map = {
    trial:   { label: "Trial",   bg: "bg-[#FFF4D6]", text: "text-[#6F5400]", border: "border-[#FFC72C]/40", dot: "bg-[#FFC72C]" },
    active:  { label: "Active",  bg: "bg-[#E6FAF6]", text: "text-[#005047]", border: "border-[#00C9A7]/40", dot: "bg-[#00C9A7]" },
    expired: { label: "Expired", bg: "bg-[#FCE8E6]", text: "text-[#BA1A1A]", border: "border-[#BA1A1A]/30", dot: "bg-[#BA1A1A]"  },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${status === "trial" ? "animate-pulse" : ""}`} />
      {s.label}
    </span>
  );
};

// ─── Cancel confirm modal ──────────────────────────────────────────────────────

const CancelModal = ({
  onConfirm,
  onDismiss,
  isPending,
}: {
  onConfirm: () => void;
  onDismiss: () => void;
  isPending: boolean;
}) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="cancel-modal-title"
    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
    onClick={onDismiss}
  >
    <div
      className="bg-white rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FCE8E6] flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-[#BA1A1A]" />
        </div>
        <div>
          <h3 id="cancel-modal-title" className="text-sm font-bold text-[#1C1B1B] m-0">
            Cancel Subscription?
          </h3>
          <p className="text-xs text-[#747878] mt-1 leading-relaxed">
            You'll lose access to Boost Listing, Analytics, and Payments at the end of your current billing period.
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onDismiss}
          className="flex-1 py-2.5 rounded-xl bg-[#F4F1EE] text-[#1C1B1B] text-sm font-semibold hover:bg-neutral-200 transition-colors"
        >
          Keep Plan
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 py-2.5 rounded-xl bg-[#BA1A1A] text-white text-sm font-bold hover:bg-[#9B1717] transition-colors disabled:opacity-60"
        >
          {isPending ? "Cancelling…" : "Yes, Cancel"}
        </button>
      </div>
    </div>
  </div>
);

// ─── Page ──────────────────────────────────────────────────────────────────────

/**
 * SubscriptionManagement — /vendor/subscription
 *
 * Live data: GET /api/business/subscription
 * Cancel:    DELETE /api/business/subscription
 * Upgrade:   → /vendor/upgrade  (Paystack checkout)
 * Trial:     → /vendor/subscription/trial
 */
const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [showCancel, setShowCancel] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // ── GET /api/business/subscription ────────────────────────────────────────
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery<SubscriptionResponse>({
    queryKey: ["business", "subscription"],
    queryFn: async () => {
      const { data } = await api.get<SubscriptionResponse>("/business/subscription");
      return data;
    },
    enabled: !!session?.token,
  });

  const sub = data?.subscription ?? null;

  // ── DELETE /api/business/subscription ─────────────────────────────────────
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<{ success: boolean; message: string }>("/business/subscription");
      return data;
    },
    onSuccess: (res) => {
      setShowCancel(false);
      showToast(res.message || "Subscription cancelled. You'll retain access until the billing period ends.");
      refetch();
    },
    onError: (err: Error) => {
      setShowCancel(false);
      showToast(err.message || "Could not cancel subscription. Please try again or contact support.");
    },
  });

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-dvh bg-[#F5F5F0]">
        <BottomNavBar items={VENDOR_NAV_ITEMS} />
        <main className="flex-1 flex items-center justify-center pt-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-[#005047]/20 border-t-[#005047] rounded-full animate-spin" />
            <p className="text-xs text-[#747878] font-medium">Loading subscription…</p>
          </div>
        </main>
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col min-h-dvh bg-[#F5F5F0]">
        <BottomNavBar items={VENDOR_NAV_ITEMS} />
        <main className="flex-1 flex items-center justify-center pt-16 px-4">
          <div className="flex flex-col items-center gap-4 text-center max-w-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#FCE8E6] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-[#BA1A1A]" />
            </div>
            <p className="text-sm font-semibold text-[#1C1B1B]">Could not load subscription</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1C1B1B] text-white text-xs font-semibold hover:bg-black transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ─── No active subscription ────────────────────────────────────────────────
  if (!sub || sub.plan === "free") {
    return (
      <div className="flex flex-col min-h-dvh bg-[#F5F5F0]">
        <BottomNavBar items={VENDOR_NAV_ITEMS} />
        <main
          className="flex-1 w-full mx-auto pt-16"
          style={{ maxWidth: "min(100%, 68rem)" }}
        >
          <div className="flex flex-col gap-5 px-4 sm:px-6 pt-4 pb-20">
            <div className="flex items-center gap-3 py-1">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-1.5 -ml-1.5 rounded-lg text-[#1C1B1B] hover:bg-black/5 active:scale-95 transition-all"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-base font-bold text-[#1C1B1B] m-0">Subscription</h1>
            </div>

            <section className="bg-white rounded-2xl p-6 border border-black/5 flex flex-col items-center gap-4 text-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#F4F1EE] flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-[#FFC72C]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1C1B1B] m-0">No Active Plan</h2>
                <p className="text-xs text-[#747878] mt-1 leading-relaxed">
                  Upgrade to Pro Business to boost your listings, access analytics, and reach daily commuters.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/vendor/subscription/trial")}
                className="w-full py-3 rounded-xl bg-[#FFC72C] text-[#1C1B1B] text-sm font-bold hover:bg-[#F0B81E] active:scale-[0.98] transition-all"
              >
                Start 7-Day Free Trial
              </button>
              <button
                type="button"
                onClick={() => navigate("/vendor/upgrade")}
                className="text-xs text-[#00C9A7] font-semibold hover:underline"
              >
                View all plans →
              </button>
            </section>
          </div>
        </main>
        <Toast message={toastMsg} />
      </div>
    );
  }

  // ─── Active subscription ───────────────────────────────────────────────────
  const daysLeft = sub.status === "trial" ? daysUntil(sub.trialEndsAt) : null;

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

          {/* Plan card */}
          <section
            aria-labelledby="sub-plan-heading"
            className="bg-[#00C9A7] rounded-2xl p-5 flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#005047]">
                  Current Plan
                </span>
                <h2
                  id="sub-plan-heading"
                  className="text-base font-bold text-white m-0 capitalize"
                >
                  {sub.plan === "pro_business" ? "Pro Business" : sub.plan}
                </h2>
                <span className="text-xs text-[#005047] font-medium capitalize">
                  {sub.billingCycle} billing
                </span>
              </div>
              <StatusBadge status={sub.status} />
            </div>

            {/* Trial countdown */}
            {sub.status === "trial" && daysLeft !== null && (
              <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2.5">
                <Clock className="w-4 h-4 text-white shrink-0" />
                <span className="text-xs font-semibold text-white">
                  {daysLeft} day{daysLeft !== 1 ? "s" : ""} left in your free trial
                  {sub.trialEndsAt ? ` — ends ${formatDate(sub.trialEndsAt)}` : ""}
                </span>
              </div>
            )}

            <div className="h-px bg-white/20" />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#005047]">
                  {sub.status === "trial" ? "First Payment" : "Next Billing"}
                </span>
                <span className="text-sm font-bold text-white">
                  {formatDate(sub.nextBillingDate)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#005047]">
                  {sub.billingCycle === "yearly" ? "Annual Price" : "Monthly Price"}
                </span>
                <span className="text-sm font-bold text-white">
                  {formatNGN(sub.monthlyPrice)}/mo
                </span>
              </div>
            </div>
          </section>

          {/* Payment method */}
          <section
            aria-labelledby="payment-method-heading"
            className="bg-white rounded-2xl p-5 border border-black/5 shadow-xs flex flex-col gap-3"
          >
            <h3
              id="payment-method-heading"
              className="text-sm font-bold text-[#1C1B1B] m-0"
            >
              Payment Method
            </h3>

            {sub.paymentMethod ? (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F4F1EE] border border-black/5">
                <div className="w-10 h-10 rounded-lg bg-[#1C1B1B] flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-bold text-[#1C1B1B]">
                    •••• {sub.paymentMethod.last4}
                  </span>
                  <span className="text-xs text-[#747878]">
                    Expires {sub.paymentMethod.expiry}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/vendor/upgrade")}
                  className="flex items-center gap-1 text-xs font-semibold text-[#00C9A7] hover:underline"
                  aria-label="Update payment method"
                >
                  Update <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FFF4D6] border border-[#FFC72C]/30">
                <AlertTriangle className="w-4 h-4 text-[#6F5400] shrink-0" />
                <span className="text-xs text-[#6F5400] font-medium flex-1">
                  No payment method on file. Add one before your trial ends.
                </span>
                <button
                  type="button"
                  onClick={() => navigate("/vendor/upgrade")}
                  className="text-xs font-bold text-[#6F5400] hover:underline shrink-0"
                >
                  Add →
                </button>
              </div>
            )}
          </section>

          {/* What's included */}
          <section className="bg-white rounded-2xl p-5 border border-black/5 shadow-xs flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#1C1B1B] m-0">Plan Features</h3>
            <ul className="flex flex-col gap-2" role="list">
              {[
                "Create and promote business listings",
                "Reach commuters near busy transport routes",
                "Access listing performance insights",
                "Manage and renew promotions",
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-2.5">
                  <BadgeCheck className="w-4 h-4 text-[#00C9A7] shrink-0" />
                  <span className="text-xs text-[#444748]">{feat}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Actions */}
          <section className="flex flex-col gap-3" aria-label="Subscription actions">
            <button
              type="button"
              onClick={() => navigate("/vendor/upgrade")}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#FFC72C] text-[#1C1B1B] text-sm font-bold hover:bg-[#F0B81E] active:scale-[0.98] transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              {sub.status === "expired" ? "Renew Subscription" : "Manage / Upgrade Plan"}
            </button>

            {sub.status !== "expired" && (
              <button
                type="button"
                onClick={() => setShowCancel(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-[#BA1A1A]/30 bg-[#FCE8E6] text-[#BA1A1A] text-sm font-bold hover:bg-[#BA1A1A]/10 active:scale-[0.98] transition-all"
              >
                <XCircle className="w-4 h-4" />
                Cancel Subscription
              </button>
            )}
          </section>

          {/* Help */}
          <section className="bg-white rounded-2xl p-5 border border-black/5 shadow-xs flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F4F1EE] flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-[#747878]" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-semibold text-[#1C1B1B]">Need help?</span>
              <span className="text-xs text-[#747878]">
                Our support team is available 24/7 for billing queries.
              </span>
            </div>
            <button
              type="button"
              onClick={() => showToast("Support request sent. Our team will reach you shortly.")}
              className="shrink-0 text-xs font-bold text-[#00C9A7] hover:underline flex items-center gap-1"
            >
              Contact <ChevronRight className="w-3 h-3" />
            </button>
          </section>

        </div>
      </main>

      {/* Cancel confirm modal */}
      {showCancel && (
        <CancelModal
          onConfirm={() => cancelMutation.mutate()}
          onDismiss={() => setShowCancel(false)}
          isPending={cancelMutation.isPending}
        />
      )}

      <Toast message={toastMsg} />
    </div>
  );
};

export default SubscriptionManagement;
