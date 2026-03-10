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
    <section className="bg-gradient-to-br from-indigo-50 to-violet-50 py-20 px-4 dark:from-gray-950 dark:to-indigo-950">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Stop Guessing. Start Converting.
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            AI-generated titles, descriptions, and keywords for every major ad platform —
            with CSV export so your team can ship immediately.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {platforms.map((p) => (
            <Card
              key={p.title}
              className="border border-indigo-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-indigo-900/50 dark:bg-gray-900"
            >
              <CardHeader className="pb-3">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/40">
                  <p.icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  {p.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{p.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CSV export callout */}
        <div className="mt-10 flex items-center justify-center gap-3 rounded-xl border border-indigo-200 bg-white px-6 py-4 text-sm font-medium text-indigo-700 shadow-sm dark:border-indigo-800 dark:bg-gray-900 dark:text-indigo-300">
          <FileDown className="h-5 w-5 shrink-0" />
          All ad sets are exportable to CSV — import directly into Google Ads, Meta Business
          Manager, or Microsoft Advertising.
        </div>
      </div>
    </section>
  );
}
