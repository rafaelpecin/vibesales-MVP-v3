import { Link2, ScanSearch, Megaphone } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Link2,
    title: "Paste Your URL",
    description:
      "Enter any landing page, product page, or homepage. Vibe Sales fetches and analyses the live content in real time.",
  },
  {
    number: "02",
    icon: ScanSearch,
    title: "Get Your SEO Audit",
    description:
      "Our AI scores your page across 20+ ranking factors — meta tags, headings, keyword density, page speed signals, mobile readiness — and lists prioritised fixes.",
  },
  {
    number: "03",
    icon: Megaphone,
    title: "Generate & Export Ads",
    description:
      "With one click, generate ready-to-launch ad copy for Google, Meta, and Bing. Review, tweak, and export to CSV. Ship in minutes.",
  },
];

/** Three-step visual flow showing how Vibe Sales works. */
export function HowItWorks() {
  return (
    <section className="bg-white py-20 px-4 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            From URL to launch-ready ads in three simple steps.
          </p>
        </div>

        <div className="relative grid gap-8 sm:grid-cols-3">
          {/* Connecting lines — visible on sm+ */}
          <div
            aria-hidden
            className="absolute top-10 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] hidden h-0.5 bg-gradient-to-r from-indigo-300 via-violet-300 to-indigo-300 sm:block dark:from-indigo-700 dark:via-violet-700 dark:to-indigo-700"
          />

          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              {/* Numbered circle */}
              <div className="relative z-10 flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg dark:border-gray-900">
                <step.icon className="h-7 w-7 text-white" />
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-extrabold text-indigo-700 ring-2 ring-indigo-200 dark:bg-gray-900 dark:text-indigo-400 dark:ring-indigo-700">
                  {step.number.replace("0", "")}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900 dark:text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
