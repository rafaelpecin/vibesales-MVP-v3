"use client";

import { useState, useMemo } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { Search, ChevronDown } from "lucide-react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type FaqItem = {
  q: string;
  a: string;
};

type Section = {
  id: string;
  title: string;
  items: FaqItem[];
};

const SECTIONS: Section[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    items: [
      {
        q: "What is SEO?",
        a: "SEO (Search Engine Optimization) is the practice of improving the quality and quantity of organic traffic to your website from search engines like Google and Bing. It involves optimizing your content, site structure, page speed, and backlinks so that search engines rank your pages higher for relevant queries.",
      },
      {
        q: "What is Vibe Sales?",
        a: "Vibe Sales is an AI-powered platform that gives you two core tools in one place: an instant SEO scanner that audits any webpage and suggests improvements, and an AI ad generator that creates ready-to-export copy for Google Ads, Meta Ads, and Bing Ads — all without needing an agency.",
      },
      {
        q: "What is a SEO service?",
        a: "A SEO service is any tool, platform, or agency that helps you analyze, plan, and execute improvements to your website's search engine visibility. Vibe Sales provides self-serve SEO tooling so you can audit and optimize your site on your own schedule.",
      },
      {
        q: "How do I optimize my page's SEO?",
        a: "Start by scanning your page with the Vibe Sales SEO Scanner. You'll receive a score alongside prioritized suggestions — things like fixing meta tags, improving heading hierarchy, boosting page speed, or adding structured data. Work through the high-impact suggestions first and re-scan to track progress.",
      },
      {
        q: "How do I improve SEO for Google?",
        a: "Focus on three pillars: relevance (keyword-rich, helpful content matching search intent), authority (quality backlinks from trusted sites), and technical health (fast load times, mobile-friendly design, proper indexing). Vibe Sales covers the technical and on-page angles automatically in every scan.",
      },
      {
        q: "Is Vibe Sales a SEO agency?",
        a: "No. Vibe Sales is a self-serve SaaS platform, not an agency. We build the tools — SEO auditing and AI ad generation — that agencies and in-house teams alike use to move faster. You stay in full control of your strategy.",
      },
      {
        q: "Is AI used for SEO and ad generation?",
        a: "Absolutely. Our AI models are purpose-built for two tasks: diagnosing SEO issues and generating high-converting ad copy. Every scan recommendation and ad variant is produced by AI trained on real-world SEO best practices and proven advertising frameworks.",
      },
      {
        q: "How do I scan my website?",
        a: 'Navigate to the Dashboard and enter any publicly accessible URL in the SEO Scanner field, then click "Scan". Vibe Sales will fetch the page, run a full audit, and return a scored report with actionable suggestions in seconds.',
      },
      {
        q: "What does the SEO score mean?",
        a: "Your SEO score is a 0–100 composite rating across on-page factors such as meta tags, content structure, image optimization, and technical signals. A higher score indicates better optimization. We also show a projected score after applying our suggestions so you know the potential uplift.",
      },
      {
        q: "How do I generate ads?",
        a: 'Go to the Ads section in the Dashboard, describe your product or service, select your target platform (Google, Meta, or Bing), and click "Generate". The AI will produce multiple ad variants — headlines, descriptions, and calls to action — ready to review and export.',
      },
    ],
  },
  {
    id: "plans-billing",
    title: "Plans & Billing",
    items: [
      {
        q: "What are the plan limits?",
        a: "Free plan: 5 AI scans/month and 1 active ad set. Start ($7/mo): 50 scans/month and 5 ad sets. Pro ($14/mo): unlimited scans and unlimited ad sets with priority AI processing and custom prompts. Enterprise: custom limits — contact us.",
      },
      {
        q: "How do I upgrade or downgrade my plan?",
        a: "Go to Settings → Billing and click \"Manage Subscription\". This opens the Stripe Customer Portal where you can switch plans instantly. Upgrades are prorated immediately; downgrades take effect at the end of your current billing cycle.",
      },
      {
        q: "How do I cancel my subscription?",
        a: "Open Settings → Billing → Manage Subscription and choose \"Cancel Plan\" inside the Stripe Customer Portal. You'll retain access to your paid features until the end of the billing period, then your account reverts to the Free tier.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) as well as digital wallets supported by Stripe, including Apple Pay and Google Pay. All transactions are securely handled by Stripe — we never store your card details.",
      },
    ],
  },
  {
    id: "seo-scanner",
    title: "Using the SEO Scanner",
    items: [
      {
        q: "What does Vibe Sales analyze?",
        a: "The scanner evaluates: page title and meta description quality, heading hierarchy (H1–H6), image alt attributes, canonical tags, Open Graph / social meta, internal link structure, keyword density, page load signals, mobile viewport configuration, and structured data presence.",
      },
      {
        q: "How are the current and projected scores calculated?",
        a: "The current score reflects the state of your page at scan time across all analyzed factors. The projected score is an AI estimate of the improvement you could achieve if you applied all the high-priority suggestions. It's a directional target, not a guarantee.",
      },
      {
        q: "Can I scan competitor websites?",
        a: "Yes. The scanner works on any publicly accessible URL. Scanning competitor pages can reveal gaps and opportunities for your own site. Just enter their URL as you would your own.",
      },
    ],
  },
  {
    id: "ad-generation",
    title: "Ad Generation",
    items: [
      {
        q: "Which platforms are supported?",
        a: "Vibe Sales currently generates ads for Google Ads (Responsive Search Ads), Meta Ads (Facebook & Instagram), and Bing Ads. Each platform's output follows the character limits and best-practice structures native to that network.",
      },
      {
        q: "How do I export ads to Google Ads?",
        a: 'After generating your ads, click "Export → Google Ads CSV". The downloaded file is formatted to the Google Ads bulk upload spec. In your Google Ads account, navigate to the campaign, open the bulk upload tool, and import the CSV.',
      },
      {
        q: "How do I export ads to Meta Ads?",
        a: 'Click "Export → Meta Ads CSV" on your generated ad set. The file follows Meta\'s ad import format. In Meta Ads Manager, use the Import feature under your campaign or ad set level to upload the CSV.',
      },
      {
        q: "Can I edit ads before exporting?",
        a: "Yes. All generated ad copy is editable inline before you export. Click any headline or description field to modify it. Changes are saved per session — if you want to persist a custom version, export it right after editing.",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    items: [
      {
        q: "My scan failed — what should I do?",
        a: "First, confirm the URL is publicly accessible (not behind a login or firewall) and that it starts with https://. If the page uses aggressive bot-blocking or Cloudflare protection, the scanner may be blocked. Try scanning a specific sub-page instead of the root, or contact support if the issue persists.",
      },
      {
        q: "The score seems wrong — why?",
        a: "Scores are based on the page as fetched by our server-side crawler, which doesn't execute JavaScript. If your page is a client-rendered SPA and critical content loads via JS, the scanner may see a sparse HTML document. Consider using server-side rendering or pre-rendering for best results.",
      },
      {
        q: "I hit my daily limit — when does it reset?",
        a: "Scan and ad generation usage resets at midnight UTC on the first day of each calendar month. If you need higher limits before then, upgrade your plan in Settings → Billing — the new limits apply immediately.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalise(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, "");
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FaqAccordionItem({
  item,
  value,
}: {
  item: FaqItem;
  value: string;
}) {
  return (
    <Accordion.Item
      value={value}
      className="border border-white/10 rounded-[8px] overflow-hidden bg-white/5 backdrop-blur-sm transition-colors data-[state=open]:bg-white/10"
    >
      <Accordion.Header asChild>
        <h3>
          <Accordion.Trigger className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-white hover:text-[#2ECC7A] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A7A4A]">
            <span>{item.q}</span>
            <ChevronDown
              size={16}
              className="shrink-0 text-[#2ECC7A] transition-transform duration-300 group-data-[state=open]:rotate-180"
              aria-hidden
            />
          </Accordion.Trigger>
        </h3>
      </Accordion.Header>
      <Accordion.Content className="overflow-hidden text-sm text-slate-300 leading-relaxed data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
        <p className="px-5 pb-4 pt-1">{item.a}</p>
      </Accordion.Content>
    </Accordion.Item>
  );
}

function SectionBlock({
  section,
  query,
}: {
  section: Section;
  query: string;
}) {
  const filtered = useMemo(() => {
    if (!query) return section.items;
    const q = normalise(query);
    return section.items.filter(
      (item) => normalise(item.q).includes(q) || normalise(item.a).includes(q)
    );
  }, [section.items, query]);

  if (filtered.length === 0) return null;

  return (
    <section aria-labelledby={`section-${section.id}`}>
      <h2
        id={`section-${section.id}`}
        className="text-lg font-semibold text-white mb-3 flex items-center gap-2"
      >
        <span className="inline-block w-1.5 h-5 rounded-full bg-[#1A7A4A]" aria-hidden />
        {section.title}
      </h2>
      <Accordion.Root type="single" collapsible className="space-y-2">
        {filtered.map((item, idx) => (
          <FaqAccordionItem
            key={idx}
            item={item}
            value={`${section.id}-${idx}`}
          />
        ))}
      </Accordion.Root>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HelpPage() {
  const [query, setQuery] = useState("");

  const hasResults = useMemo(() => {
    if (!query) return true;
    const q = normalise(query);
    return SECTIONS.some((s) =>
      s.items.some(
        (item) =>
          normalise(item.q).includes(q) || normalise(item.a).includes(q)
      )
    );
  }, [query]);

  return (
    <main className="min-h-screen bg-[#1A1F2E] px-4 py-20">
      {/* Header */}
      <div className="max-w-2xl mx-auto text-center mb-12">
        <p className="text-[#2ECC7A] text-sm font-medium tracking-widest uppercase mb-3">
          Support
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Help &amp; FAQ
        </h1>
        <p className="text-slate-400 text-base">
          Everything you need to get the most out of Vibe Sales — from your
          first scan to exporting polished ad copy.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-14">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search questions…"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            className="w-full pl-10 pr-4 h-11 rounded-[8px] bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#64748B] focus:outline-none focus:border-[#1A7A4A] focus:ring-2 focus:ring-[#1A7A4A]/30"
            aria-label="Search FAQ"
          />
        </div>
      </div>

      {/* FAQ sections */}
      <div className="max-w-2xl mx-auto space-y-10">
        {SECTIONS.map((section) => (
          <SectionBlock key={section.id} section={section} query={query} />
        ))}

        {!hasResults && (
          <div className="text-center py-16 text-[#64748B]">
            <p className="text-base">
              No results for{" "}
              <span className="text-slate-300 font-medium">
                &ldquo;{query}&rdquo;
              </span>
              .
            </p>
            <p className="text-sm mt-1">
              Try different keywords or{" "}
              <a
                href="mailto:support@vibesales.com"
                className="text-[#2ECC7A] hover:text-[#2ECC7A] underline underline-offset-2"
              >
                contact support
              </a>
              .
            </p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="max-w-2xl mx-auto mt-20 text-center border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm px-6 py-10">
        <p className="text-white font-semibold text-lg mb-1">
          Still have questions?
        </p>
        <p className="text-slate-400 text-sm mb-5">
          Our team is happy to help. Reach out and we'll get back to you within
          one business day.
        </p>
        <a
          href="mailto:support@vibesales.com"
          className="inline-flex items-center gap-2 rounded-[8px] bg-[#1A7A4A] hover:bg-[#2ECC7A] transition-colors text-white text-sm font-medium px-5 py-2.5"
        >
          Contact Support
        </a>
      </div>
    </main>
  );
}
