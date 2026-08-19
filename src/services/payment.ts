import PaystackPop from "@paystack/inline-js";
import { api } from "../lib/axios";

// ─── Backend plan contract ─────────────────────────────────────────────────────
// POST /api/payments/initialize  → body: { plan: "weekly" | "monthly" }
// GET  /api/payments/verify/:reference
// GET  /api/subscription/status

export type PlanKey = "weekly" | "monthly";

// ─── Prices (kobo — 1 NGN = 100 kobo) ──────────────────────────────────────────
// Amounts match backend PLANS config exactly
export const PLAN_PRICES: Record<PlanKey, { amount: number; label: string; naira: number }> = {
  weekly:  { amount: 150_000,  label: "₦1,500 / week",  naira: 1_500  },
  monthly: { amount: 550_000,  label: "₦5,500 / month", naira: 5_500  },
};

// Keep BillingCycle as an alias so other files don't break
export type BillingCycle = PlanKey;

// ─── API response types ────────────────────────────────────────────────────────

export interface InitializePaymentResponse {
  success: boolean;
  message: string;
  payment: {
    id: string;
    reference: string;
    plan: PlanKey;
    amount: number;
    amountInNaira: number;
  };
  authorizationUrl: string;
  accessCode: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  subscription: {
    plan: PlanKey;
    amount: number;
    startDate: string;
    endDate: string;
    status: "active";
  };
}

export interface SubscriptionStatusResponse {
  success: boolean;
  subscription: {
    status: "trial" | "active" | "expired";
    isPremium: boolean;
    expiresAt: string | null;
    daysRemaining: number;
  };
}

// ─── Paystack public key ────────────────────────────────────────────────────────

const PAYSTACK_PUBLIC_KEY =
  (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined) ?? "";

// ─── API calls ──────────────────────────────────────────────────────────────────

/**
 * POST /api/payments/initialize
 * Body: { plan: "weekly" | "monthly" }
 * Returns accessCode + reference from Paystack via backend.
 */
export async function initializePayment(
  plan: PlanKey
): Promise<InitializePaymentResponse> {
  const { data } = await api.post<InitializePaymentResponse>(
    "/payments/initialize",
    { plan }
  );
  return data;
}

/**
 * GET /api/payments/verify/:reference
 * Verifies payment with Paystack and activates business premium.
 */
export async function verifyPayment(
  reference: string
): Promise<VerifyPaymentResponse> {
  const { data } = await api.get<VerifyPaymentResponse>(
    `/payments/verify/${reference}`
  );
  return data;
}

/**
 * GET /api/subscription/status
 * Returns current subscription status for the logged-in business.
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
  const { data } = await api.get<SubscriptionStatusResponse>("/subscription/status");
  return data;
}

// ─── Checkout orchestration ─────────────────────────────────────────────────────

export interface OpenCheckoutOptions {
  email: string;
  plan: PlanKey;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
  onError: (err: Error) => void;
}

/**
 * Full Paystack inline checkout flow:
 * 1. Calls POST /api/payments/initialize to get accessCode + reference from backend
 * 2. Opens Paystack popup using the accessCode (server-authorized flow)
 * 3. onSuccess(reference) fires — caller then calls verifyPayment(reference)
 */
export async function openPaystackCheckout(opts: OpenCheckoutOptions): Promise<void> {
  const { email, plan, onSuccess, onCancel, onError } = opts;

  if (!PAYSTACK_PUBLIC_KEY) {
    onError(new Error("Payment is not configured. Please contact support."));
    return;
  }

  try {
    // Initialize on backend first — backend creates the Payment record
    // and returns the Paystack accessCode
    const init = await initializePayment(plan);

    const popup = new PaystackPop();
    popup.newTransaction({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: PLAN_PRICES[plan].amount,
      currency: "NGN",
      accessCode: init.accessCode,
      ref: init.payment.reference,
      metadata: { plan, btbs_payment_id: init.payment.id },
      onSuccess: (transaction) => onSuccess(transaction.reference),
      onCancel,
    });
  } catch (err) {
    onError(err instanceof Error ? err : new Error("Could not open payment. Please try again."));
  }
}
