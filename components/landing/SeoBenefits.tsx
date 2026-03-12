import { TrendingUp, ShieldCheck, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const benefits = [
  {
    icon: TrendingUp,
    title: "Organic Traffic That Compounds",
    body: "Every page that ranks is a 24/7 sales rep that never sleeps. Unlike paid ads that stop the moment your budget does, SEO-driven traffic builds on itself — each improvement pushes you higher, bringing more qualified visitors month after month without incremental spend.",
  },
  {
    icon: ShieldCheck,
    title: "Brand Reputation You Can Own",
    body: "Customers trust organic search results three times more than paid listings. When your business appears at the top of Google naturally, it signals credibility and authority. Vibe Sales helps you identify exactly what needs fixing so your brand becomes the go-to choice in your niche.",
  },
  {
    icon: DollarSign,
    title: "The Best Long-Term ROI in Marketing",
    body: "Studies consistently show SEO delivers a higher ROI than almost any other channel over a 12-month horizon. By fixing technical issues, improving on-page signals, and aligning your content with what buyers actually search, you turn your website into an asset — not just a cost center.",
  },
];

/** SEO benefits section explaining why organic search still matters in 2026. */
export function SeoBenefits() {
  return (
    <section className="bg-white py-20 px-4 ">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1A1F2E]  sm:text-4xl">
            Why SEO Still Matters in 2026?
          </h2>
          <p className="mt-4 text-lg text-[#64748B] ">
            AI-generated content flooded the web. That makes technical SEO and trust signals more
            valuable than ever.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {benefits.map((b) => (
            <Card
              key={b.title}
              className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md  "
            >
              <CardHeader className="pb-3">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-[#f0fdf8] dark:bg-[#1A7A4A]/10">
                  <b.icon className="h-5 w-5 text-[#1A7A4A] dark:text-[#2ECC7A]" />
                </div>
                <CardTitle className="text-lg font-bold text-[#1A1F2E] ">
                  {b.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-[#64748B] ">{b.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
