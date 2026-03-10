import type { Plan } from "@/types";

/**
 * Stripe Price IDs for each paid plan.
 * These values must match the IDs configured in your Stripe dashboard.
 * Set to empty string for plans that are not yet active.
 */
export const STRIPE_PRICE_IDS: Record<string, string> = {
  start: process.env.NEXT_PUBLIC_STRIPE_PRICE_START ?? "",
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? "",
};

/**
 * Canonical plan definitions for vibe-sales.
 * Limits define how many AI scans and ad sets a user may create per billing period.
 */
export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Get started with core features at no cost.",
    priceMonthly: 0,
    stripePriceId: null,
    features: [
      "5 AI scans per month",
      "1 active ad set",
      "Basic scan results",
      "CSV export",
      "Community support",
    ],
    limits: {
      scansPerMonth: 5,
      adSets: 1,
      exportEnabled: true,
      prioritySupport: false,
      customPrompts: false,
    },
    isComingSoon: false,
    highlighted: false,
  },
  {
    id: "start",
    name: "Start",
    description: "Perfect for solopreneurs and small teams ramping up.",
    priceMonthly: 7,
    stripePriceId: STRIPE_PRICE_IDS.start,
    features: [
      "50 AI scans per month",
      "5 active ad sets",
      "Advanced scan results",
      "CSV export",
      "Email support",
    ],
    limits: {
      scansPerMonth: 50,
      adSets: 5,
      exportEnabled: true,
      prioritySupport: false,
      customPrompts: false,
    },
    isComingSoon: false,
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing businesses that need more power.",
    priceMonthly: 14,
    stripePriceId: STRIPE_PRICE_IDS.pro,
    features: [
      "Unlimited AI scans",
      "Unlimited ad sets",
      "Priority AI processing",
      "CSV export",
      "Priority support",
      "Custom AI prompts",
    ],
    limits: {
      scansPerMonth: Infinity,
      adSets: Infinity,
      exportEnabled: true,
      prioritySupport: true,
      customPrompts: true,
    },
    isComingSoon: false,
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for large organisations.",
    priceMonthly: null,
    stripePriceId: null,
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "SSO / SAML",
      "SLA guarantee",
      "Custom integrations",
    ],
    limits: {
      scansPerMonth: Infinity,
      adSets: Infinity,
      exportEnabled: true,
      prioritySupport: true,
      customPrompts: true,
    },
    isComingSoon: true,
    highlighted: false,
  },
];

/**
 * Returns a plan definition by its ID.
 *
 * @param id - The plan identifier (e.g. "free", "start", "pro", "enterprise")
 * @returns The matching Plan or undefined if not found
 */
export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((plan) => plan.id === id);
}

/**
 * Returns the scan limit for a given plan ID.
 * Returns 0 for unknown plans as a safe default.
 *
 * @param planId - The plan identifier
 */
export function getScanLimit(planId: string): number {
  return getPlanById(planId)?.limits.scansPerMonth ?? 0;
}
