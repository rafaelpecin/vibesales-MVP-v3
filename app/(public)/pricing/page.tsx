"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Zap, Star, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

// ─── Plan data matching the DB seed ─────────────────────────────────────────

interface PricingPlan {
  id: string;
  name: string;
  price: number | null;
  description: string;
  buttonLabel: string;
  highlighted: boolean;
  isComingSoon: boolean;
  scansPerDay: number | null;
  adsPerDay: number | null;
  keywordsPerSearch: number | null;
  features: { label: string; included: boolean }[];
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Get started with core features at no cost.",
    buttonLabel: "Free",
    highlighted: false,
    isComingSoon: false,
    scansPerDay: 1,
    adsPerDay: 10,
    keywordsPerSearch: 10,
    features: [
      { label: "1 scan / day", included: true },
      { label: "10 ads / day", included: true },
      { label: "10 keywords / search", included: true },
      { label: "CSV export", included: true },
      { label: "Email support", included: false },
      { label: "Priority AI processing", included: false },
      { label: "Custom AI prompts", included: false },
      { label: "Priority support", included: false },
    ],
  },
  {
    id: "start",
    name: "Start",
    price: 7,
    description: "Perfect for solopreneurs and small teams.",
    buttonLabel: "Get Started",
    highlighted: false,
    isComingSoon: false,
    scansPerDay: 5,
    adsPerDay: 50,
    keywordsPerSearch: 50,
    features: [
      { label: "5 scans / day", included: true },
      { label: "50 ads / day", included: true },
      { label: "50 keywords / search", included: true },
      { label: "CSV export", included: true },
      { label: "Email support", included: true },
      { label: "Priority AI processing", included: false },
      { label: "Custom AI prompts", included: false },
      { label: "Priority support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 14,
    description: "For growing businesses that need more power.",
    buttonLabel: "Go Pro",
    highlighted: true,
    isComingSoon: false,
    scansPerDay: 50,
    adsPerDay: 200,
    keywordsPerSearch: 200,
    features: [
      { label: "50 scans / day", included: true },
      { label: "200 ads / day", included: true },
      { label: "200 keywords / search", included: true },
      { label: "CSV export", included: true },
      { label: "Email support", included: true },
      { label: "Priority AI processing", included: true },
      { label: "Custom AI prompts", included: true },
      { label: "Priority support", included: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    description: "Custom solutions for large organisations.",
    buttonLabel: "Contact Us",
    highlighted: false,
    isComingSoon: true,
    scansPerDay: null,
    adsPerDay: null,
    keywordsPerSearch: null,
    features: [
      { label: "Unlimited scans", included: true },
      { label: "Unlimited ads", included: true },
      { label: "Unlimited keywords", included: true },
      { label: "CSV export", included: true },
      { label: "Email support", included: true },
      { label: "Priority AI processing", included: true },
      { label: "Custom AI prompts", included: true },
      { label: "Dedicated account manager", included: true },
    ],
  },
];

// ─── Comparison table rows ───────────────────────────────────────────────────

const COMPARISON_ROWS = [
  { label: "Scans per day", values: ["1", "5", "50", "Unlimited"] },
  { label: "Ads per day", values: ["10", "50", "200", "Unlimited"] },
  { label: "Keywords per search", values: ["10", "50", "200", "Unlimited"] },
  { label: "CSV export", values: [true, true, true, true] },
  { label: "Email support", values: [false, true, true, true] },
  { label: "Priority AI processing", values: [false, false, true, true] },
  { label: "Custom AI prompts", values: [false, false, true, true] },
  { label: "Priority support", values: [false, false, true, true] },
  { label: "Dedicated account manager", values: [false, false, false, true] },
];

// ─── Plan card ───────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: PricingPlan;
  isCurrentPlan: boolean;
  onUpgrade: (planId: string) => void;
  isPending: boolean;
  isLoggedIn: boolean;
}

function PlanCard({ plan, isCurrentPlan, onUpgrade, isPending, isLoggedIn }: PlanCardProps) {
  const isFree = plan.price === 0;

  const handleClick = () => {
    if (plan.isComingSoon || isFree || isCurrentPlan) return;
    onUpgrade(plan.id);
  };

  return (
    <Card
      className={[
        "relative flex flex-col transition-shadow",
        plan.highlighted
          ? "border-2 border-indigo-500 shadow-2xl dark:border-indigo-400"
          : "border border-gray-200 shadow-sm dark:border-gray-800 dark:bg-gray-950",
        plan.isComingSoon ? "opacity-60" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Badges */}
      {plan.highlighted && !plan.isComingSoon && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <Badge className="gap-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
            <Zap className="h-3 w-3" /> Most Popular
          </Badge>
        </div>
      )}
      {plan.isComingSoon && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <Badge variant="secondary" className="gap-1">
            <Star className="h-3 w-3" /> Coming Soon
          </Badge>
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-3.5 right-4 whitespace-nowrap">
          <Badge className="bg-green-600 text-white">Current Plan</Badge>
        </div>
      )}

      <CardHeader className="pb-3 pt-7">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          {plan.id === "enterprise" && <Building2 className="h-4 w-4 text-gray-500" />}
          {plan.name}
        </CardTitle>

        <div className="mt-1">
          {plan.isComingSoon ? (
            <p className="text-2xl font-extrabold text-gray-400 dark:text-gray-500">
              Custom pricing
            </p>
          ) : plan.price === 0 ? (
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">Free</p>
          ) : (
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
              ${plan.price}
              <span className="text-base font-normal text-gray-500">/mo</span>
            </p>
          )}
        </div>

        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{plan.description}</p>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <ul className="space-y-2">
          {plan.features.map((f) => (
            <li
              key={f.label}
              className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              {f.included ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
              ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />
              )}
              <span className={f.included ? "" : "text-gray-400 dark:text-gray-600"}>
                {f.label}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pb-6">
        {plan.isComingSoon ? (
          <Button variant="outline" className="w-full" disabled>
            Contact Us
          </Button>
        ) : isCurrentPlan ? (
          <Button variant="outline" className="w-full" disabled>
            Current Plan
          </Button>
        ) : isFree ? (
          <Button variant="outline" className="w-full" disabled>
            Free
          </Button>
        ) : (
          <Button
            className={
              plan.highlighted
                ? "w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700"
                : "w-full"
            }
            onClick={handleClick}
            disabled={isPending}
          >
            {isPending ? "Redirecting…" : plan.buttonLabel}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function PricingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  // Determine user's current plan from Supabase user metadata or default to free
  // The plan name is stored in user_metadata.plan_id set by the webhook
  const currentPlanId: string =
    (user?.user_metadata?.plan_id as string | undefined) ?? "free";

  const handleUpgrade = (planId: string) => {
    if (!user) {
      router.push(`/login?redirect=/pricing`);
      return;
    }

    setCheckoutError(null);
    setActivePlanId(planId);

    startTransition(async () => {
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId }),
        });

        const data = await res.json();

        if (!res.ok) {
          setCheckoutError(data.error ?? "Something went wrong. Please try again.");
          setActivePlanId(null);
          return;
        }

        if (data.url) {
          window.location.href = data.url;
        }
      } catch {
        setCheckoutError("Network error. Please check your connection and try again.");
        setActivePlanId(null);
      }
    });
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* ── Hero ── */}
      <section className="px-4 pb-12 pt-20 text-center">
        <Badge variant="secondary" className="mb-4">
          Pricing
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
          Start free, upgrade when you grow. No contracts. Cancel anytime.
        </p>
      </section>

      {/* ── Plan Cards ── */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        {checkoutError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {checkoutError}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className="h-96 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRICING_PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={!plan.isComingSoon && currentPlanId === plan.id}
                onUpgrade={handleUpgrade}
                isPending={isPending && activePlanId === plan.id}
                isLoggedIn={!!user}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Feature Comparison Table ── */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Full Feature Comparison
        </h2>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Feature
                </th>
                {PRICING_PLANS.map((plan) => (
                  <th
                    key={plan.id}
                    className={[
                      "px-4 py-3 text-center font-semibold",
                      plan.highlighted
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-700 dark:text-gray-300",
                    ].join(" ")}
                  >
                    {plan.name}
                    {plan.price !== null && plan.price > 0 && (
                      <span className="ml-1 font-normal text-gray-400">${plan.price}/mo</span>
                    )}
                    {plan.price === 0 && (
                      <span className="ml-1 font-normal text-gray-400">Free</span>
                    )}
                    {plan.isComingSoon && (
                      <span className="ml-1 font-normal text-gray-400">Soon</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={row.label}
                  className={[
                    "border-b border-gray-100 last:border-0 dark:border-gray-800",
                    i % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-gray-900/30",
                  ].join(" ")}
                >
                  <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                    {row.label}
                  </td>
                  {row.values.map((val, j) => (
                    <td key={j} className="px-4 py-3 text-center">
                      {typeof val === "boolean" ? (
                        val ? (
                          <Check className="mx-auto h-4 w-4 text-indigo-500" />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-gray-300 dark:text-gray-600" />
                        )
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FAQ / CTA ── */}
      <section className="bg-gray-50 px-4 py-16 text-center dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Questions? We&apos;re here to help.
        </h2>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          Reach out at{" "}
          <a
            href="mailto:support@vibesales.io"
            className="text-indigo-600 underline dark:text-indigo-400"
          >
            support@vibesales.io
          </a>{" "}
          and we&apos;ll get back to you within 24 hours.
        </p>
      </section>
    </main>
  );
}
