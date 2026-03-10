import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/constants/plans";

/** Pricing preview section — full detail lives on /pricing. */
export function PricingPreview() {
  return (
    <section className="bg-white py-20 px-4 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Start free, upgrade when you grow. No contracts, cancel anytime.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={
                plan.highlighted
                  ? "relative border-2 border-indigo-500 shadow-xl dark:border-indigo-400"
                  : "border border-gray-200 shadow-sm dark:border-gray-800 dark:bg-gray-950"
              }
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                    <Zap className="h-3 w-3" /> Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-3 pt-6">
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </CardTitle>

                {plan.isComingSoon ? (
                  <p className="mt-1 text-2xl font-extrabold text-gray-400 dark:text-gray-500">
                    Coming Soon
                  </p>
                ) : plan.priceMonthly === 0 ? (
                  <p className="mt-1 text-3xl font-extrabold text-gray-900 dark:text-white">
                    Free
                  </p>
                ) : (
                  <p className="mt-1 text-3xl font-extrabold text-gray-900 dark:text-white">
                    ${plan.priceMonthly}
                    <span className="text-base font-normal text-gray-500">/mo</span>
                  </p>
                )}

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="pb-4">
                <ul className="space-y-2">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pb-6">
                {plan.isComingSoon ? (
                  <Button variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                ) : plan.priceMonthly === 0 ? (
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700"
                  >
                    <Link href="/register">Get Started Free</Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant={plan.highlighted ? "default" : "outline"}
                    className={
                      plan.highlighted
                        ? "w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700"
                        : "w-full"
                    }
                  >
                    <Link href="/register">Upgrade to {plan.name}</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Need a deeper look?{" "}
          <Link
            href="/pricing"
            className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            See full pricing details →
          </Link>
        </p>
      </div>
    </section>
  );
}
