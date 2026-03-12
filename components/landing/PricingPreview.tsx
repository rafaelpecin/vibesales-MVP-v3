import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/constants/plans";

/** Pricing preview section — full detail lives on /pricing. */
export function PricingPreview() {
  return (
    <section className="bg-white py-20 px-4 ">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1A1F2E]  sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-[#64748B] ">
            Start free, upgrade when you grow. No contracts, cancel anytime.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={
                plan.highlighted
                  ? "relative border-2 border-[#1A7A4A] shadow-xl"
                  : "border border-gray-200 shadow-sm  "
              }
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1 bg-gradient-to-r from-[#1A7A4A] to-[#1B4F8A] text-white">
                    <Zap className="h-3 w-3" /> Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-3 pt-6">
                <CardTitle className="text-lg font-bold text-[#1A1F2E] ">
                  {plan.name}
                </CardTitle>

                {plan.isComingSoon ? (
                  <p className="mt-1 text-2xl font-extrabold text-gray-400">
                    Coming Soon
                  </p>
                ) : plan.priceMonthly === 0 ? (
                  <p className="mt-1 text-3xl font-extrabold text-[#1A1F2E] ">
                    Free
                  </p>
                ) : (
                  <p className="mt-1 text-3xl font-extrabold text-[#1A1F2E] ">
                    ${plan.priceMonthly}
                    <span className="text-base font-normal text-[#64748B]">/mo</span>
                  </p>
                )}

                <p className="mt-1 text-xs text-[#64748B] ">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="pb-4">
                <ul className="space-y-2">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#1A1F2E] ">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1A7A4A]" />
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
                    className="w-full bg-gradient-to-r from-[#1A7A4A] to-[#1B4F8A] text-white hover:from-[#155e3a] hover:to-[#163f6e]"
                  >
                    <Link href="/register">Get Started Free</Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant={plan.highlighted ? "default" : "outline"}
                    className={
                      plan.highlighted
                        ? "w-full bg-gradient-to-r from-[#1A7A4A] to-[#1B4F8A] text-white hover:from-[#155e3a] hover:to-[#163f6e]"
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

        <p className="mt-8 text-center text-sm text-[#64748B] ">
          Need a deeper look?{" "}
          <Link
            href="/pricing"
            className="font-medium text-[#1A7A4A] underline-offset-4 hover:underline"
          >
            See full pricing details →
          </Link>
        </p>
      </div>
    </section>
  );
}
