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
    <section className="bg-white py-20 px-4 ">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1A1F2E]  sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-[#64748B] ">
            From URL to launch-ready ads in three simple steps.
          </p>
        </div>

        <div className="relative grid gap-8 sm:grid-cols-3">
          {/* Connecting lines — visible on sm+ */}
          <div
            aria-hidden
            className="absolute top-10 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] hidden h-0.5 bg-gradient-to-r from-[#2ECC7A] via-[#3B82F6] to-[#2ECC7A] sm:block "
          />

          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              {/* Numbered circle */}
              <div className="relative z-10 flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-white bg-[#1A7A4A] shadow-lg">
                <step.icon className="h-7 w-7 text-white" />
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-extrabold text-[#1A7A4A] ring-2 ring-[#bbf7d0] ">
                  {step.number.replace("0", "")}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#1A1F2E] ">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#64748B] ">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
