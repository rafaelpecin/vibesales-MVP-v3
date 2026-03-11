/**
 * Stripe plan definitions used by checkout and webhook handlers.
 * Matches the plans seeded in the database and defined in /constants/plans.ts.
 *
 * planId here corresponds to the `name` column (lowercased) in public.plans.
 */
export interface StripePlanConfig {
  planId: string;
  /** Human-readable label */
  name: string;
  /** Monthly price in USD cents */
  unitAmount: number;
  /** Stripe Price ID — set via environment variables */
  priceId: string;
}

export const STRIPE_PLANS: StripePlanConfig[] = [
  {
    planId: "start",
    name: "Start",
    unitAmount: 700,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_START ?? "",
  },
  {
    planId: "pro",
    name: "Pro",
    unitAmount: 1400,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? "",
  },
];

/** Returns the Stripe plan config by its planId, or undefined if not found. */
export function getStripePlanById(planId: string): StripePlanConfig | undefined {
  return STRIPE_PLANS.find((p) => p.planId === planId);
}

/** Returns the planId that maps to a given Stripe price ID, or undefined. */
export function getPlanIdByPriceId(priceId: string): string | undefined {
  return STRIPE_PLANS.find((p) => p.priceId === priceId)?.planId;
}
