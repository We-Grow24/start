// ═══════════════════════════════════════════════════════════════
// SVARNEX — Razorpay Event Type Constants
// ═══════════════════════════════════════════════════════════════

export const RAZORPAY_EVENTS = {
  PAYMENT_CAPTURED: "payment.captured",
  PAYMENT_FAILED: "payment.failed",
  SUBSCRIPTION_CHARGED: "subscription.charged",
  SUBSCRIPTION_CANCELLED: "subscription.cancelled",
  SUBSCRIPTION_HALTED: "subscription.halted",
} as const;
