import "server-only";
import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Singleton Razorpay server-side client.
 * Uses RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET from env.
 */
export const razorpayClient = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * Verifies a Razorpay payment signature using HMAC-SHA256.
 * Used after Razorpay Checkout completes to confirm payment authenticity.
 *
 * @param orderId  - Razorpay order ID
 * @param paymentId - Razorpay payment ID
 * @param signature - Signature from Razorpay Checkout response
 * @returns true if signature is valid
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return expected === signature;
}

/**
 * Verifies Razorpay webhook signature (HMAC-SHA256 of raw body).
 * Used in POST /api/webhooks/razorpay.
 *
 * @param rawBody - Raw request body as string
 * @param signature - x-razorpay-signature header value
 * @returns true if webhook signature is valid
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}

// ─── Razorpay Plan & Chip constants ────────────────────────────

export const PLAN_TO_TIER = {
  svarnex_presence_monthly: "PRESENCE",
  svarnex_presence_yearly: "PRESENCE",
  svarnex_business_monthly: "BUSINESS",
  svarnex_business_yearly: "BUSINESS",
  svarnex_scale_monthly: "SCALE",
  svarnex_scale_yearly: "SCALE",
} as const;

export const SIGNUP_CHIP_BONUS = {
  PRESENCE: 100,
  BUSINESS: 1000,
  SCALE: 2500,
} as const;

export const MONTHLY_REPLENISHMENT = {
  PRESENCE: 50,
  BUSINESS: 150,
  SCALE: 500,
} as const;

export const CHIP_PACKAGES = {
  100: { chips: 100, amount_paise: 10000 },
  500: { chips: 500, amount_paise: 47500 },
  1000: { chips: 1000, amount_paise: 90000 },
} as const;

export type ChipPackageKey = keyof typeof CHIP_PACKAGES;

// ─── Razorpay UPI Payment Method Config (Section 5A) ──────────
// India-first: UPI is mandatory for all Razorpay orders.
// These options are passed client-side to configure Checkout preferences.

export const RAZORPAY_METHOD_CONFIG = {
  upi: true,
  card: true,
  netbanking: true,
  wallet: true,
} as const;

/** Returns Razorpay order creation options with UPI enabled as a note. */
export function buildOrderOptions(opts: {
  amount_paise: number;
  currency: string;
  receipt: string;
  notes: Record<string, string>;
}) {
  return {
    amount: opts.amount_paise,
    currency: opts.currency,
    receipt: opts.receipt,
    notes: { ...opts.notes, preferred_method: "upi" },
    payment_capture: true,
  };
}
