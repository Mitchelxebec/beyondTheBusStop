import PaystackPop from "@paystack/inline-js";
import { api } from "../lib/axios";

/* ── Types ─────────────────────────────────────────────────────────────── */

export type BillingCycle = "monthly" | "yearly";

export interface InitializePaymentPayload {
  plan: "pro_business";
  billingCycle: BillingCycle;
}

export interface InitializePaymentResponse {
  success: boolean;
  accessCode: string;
  reference: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  subscription: {
    plan: string;
    billingCycle: BillingCycle;
    status: "active" | "trial" | "expired";
    expiresAt: string;
  };
}

/* ── Prices (kobo — 1 NGN = 100 kobo) ──────────────────────────────────── */

export const PLAN_PRICES: Record<BillingCycle, { amount: number; label: string }> = {
  monthly: { amount: 1_500_000, label: "₦15,000 / month" },
  yearly:  { amount: 13_500_000, label: "₦135,000 / year" },
};

/* ── Paystack public key ────────────────────────────────────────────────── */

const PAYSTACK_PUBLIC_KEY =
  (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined) ?? "";

/* ── API calls ─────────────────────────────────────────────────────────── */

/**
 * POST /api/business/payment/initialize
 * Backend creates a Paystack transaction and returns accessCode + reference.
 */
export async function initializePayment(
  payload: InitializePaymentPayload
): Promise<InitializePaymentResponse> {
  const { data } = await api.post<InitializePaymentResponse>(
    "/business/payment/initialize",
    payload
  );
  return data;
}

/**
 * POST /api/business/payment/verify
 * Backend verifies the transaction with Paystack and activates the subscription.
 */
export async function verifyPayment(
  reference: string
): Promise<VerifyPaymentResponse> {
  const { data } = await api.post<VerifyPaymentResponse>(
    "/business/payment/verify",
    { reference }
  );
  return data;
}

/* ── Orchestrated checkout ──────────────────────────────────────────────── */

export interface OpenCheckoutOptions {
  email: string;
  billingCycle: BillingCycle;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
  onError: (err: Error) => void;
}

/**
 * Full Paystack inline checkout flow.
 *
 * Opens the Paystack popup directly using the public key + email + amount.
 * No backend initialization call is needed — Paystack generates the reference
 * client-side and the popup handles everything.
 *
 * onSuccess(reference) fires when the user completes payment.
 * The caller should then call verifyPayment(reference) to confirm server-side
 * once POST /api/business/payment/verify is available on the backend.
 */
export async function openPaystackCheckout(opts: OpenCheckoutOptions): Promise<void> {
  const { email, billingCycle, onSuccess, onCancel, onError } = opts;

  if (!PAYSTACK_PUBLIC_KEY) {
    onError(new Error("Payment is not configured. Please contact support."));
    return;
  }

  try {
    const popup = new PaystackPop();
    popup.newTransaction({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: PLAN_PRICES[billingCycle].amount,
      currency: "NGN",
      metadata: { plan: "pro_business", billingCycle },
      onSuccess: (transaction) => onSuccess(transaction.reference),
      onCancel,
    });
  } catch (err) {
    onError(err instanceof Error ? err : new Error("Could not open payment. Please try again."));
  }
}
