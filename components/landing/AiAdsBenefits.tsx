import { Chrome, Facebook, Search, FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const platforms = [
  {
    icon: Chrome,
    title: "Google Ads — Done in Seconds",
    body: "Vibe Sales generates responsive search ad headlines, descriptions, and a tightly themed keyword list tailored to your page content. Every output follows Google's character limits and best-practice ad structure — ready to paste into Google Ads. Export to CSV with one click.",
  },
  {
    icon: Facebook,
    title: "Meta Ads — Copy That Converts",
    body: "Stop staring at a blank creative brief. Our AI reads your landing page and writes primary text, ad headlines, and link descriptions optimized for Facebook and Instagram feeds. Different hooks, angles, and CTAs per variation so you can split-test from day one.",
  },
  {
    icon: Search,
    title: "Bing Ads — Reach the Overlooked Audience",
    body: "Microsoft Advertising reaches over 680 million monthly searchers that Google doesn't. Vibe Sales generates Bing-ready ad copy in the same workflow — so you capture high-intent, lower-CPC traffic most competitors ignore. Import-ready CSV included.",
  },
];

/** AI ad generation benefits section. */
export function AiAdsBenefits() {
  return (
    <section className="bg-gradient-to-br from-[#f0fdf8] to-[#eff6ff] py-20 px-4 ">
      <div className="mx-auto max-w-5xl hero-benefits">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1A1F2E]  sm:text-4xl">
            Stop Guessing. Start Converting.
          </h2>
          <p className="mt-4 text-lg text-[#64748B] ">
            AI-generated titles, descriptions, and keywords for every major ad platform —
            with CSV export so your team can ship immediately.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {platforms.map((p) => (
            <Card
              key={p.title}
              className="border border-[#E2E8F0] bg-white shadow-sm transition-shadow hover:shadow-md  "
            >
              <CardHeader className="pb-3">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-[#f0fdf8]">
                  <p.icon className="h-5 w-5 text-[#1A7A4A]" />
                </div>
                <CardTitle className="text-lg font-bold text-[#1A1F2E] ">
                  {p.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-[#64748B] ">{p.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CSV export callout */}
        <div className="mt-10 flex items-center justify-center gap-3 rounded-[8px] border border-[#bbf7d0] bg-white px-6 py-4 text-sm font-medium text-[#1A7A4A] shadow-sm ">
          <FileDown className="h-5 w-5 shrink-0" />
          All ad sets are exportable to CSV — import directly into Google Ads, Meta Business
          Manager, or Microsoft Advertising.
        </div>
      </div>
    </section>
  );
}
