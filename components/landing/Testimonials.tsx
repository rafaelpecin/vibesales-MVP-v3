import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Sarah M.",
    role: "E-commerce Founder",
    avatar: "SM",
    quote:
      "I plugged in our product page and within 60 seconds had a full SEO report plus six Google ad variations ready to go. We cut our ad setup time from two days to under an hour. The keyword suggestions alone were worth the subscription.",
  },
  {
    name: "Daniel R.",
    role: "Digital Marketing Manager",
    avatar: "DR",
    quote:
      "Our agency runs campaigns for 30+ clients. Vibe Sales has become our first stop for every new landing page — the AI audits catch issues our manual checklist misses, and the CSV export fits straight into our Google Ads workflow.",
  },
  {
    name: "Priya K.",
    role: "SaaS Growth Lead",
    avatar: "PK",
    quote:
      "We were spending $4k/month on an SEO consultant for recommendations our team never had time to implement. Now we use Vibe Sales to prioritise the highest-impact fixes ourselves. Organic traffic is up 38% in three months.",
  },
];

/** Social proof section with placeholder testimonial cards. */
export function Testimonials() {
  return (
    <section className="bg-gradient-to-br from-[#f0fdf8] to-[#eff6ff] py-20 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1A1F2E]  sm:text-4xl">
            Loved by Marketers &amp; Founders
          </h2>
          <p className="mt-4 text-lg text-[#64748B] ">
            Join thousands of businesses already growing with Vibe Sales.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {testimonials.map((t) => (
            <Card
              key={t.name}
              className="border border-[#E2E8F0] bg-white shadow-sm "
            >
              <CardContent className="p-6">
                {/* Stars */}
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                      aria-hidden
                    />
                  ))}
                </div>

                <blockquote className="mb-5 text-sm leading-relaxed text-[#1A1F2E] ">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A7A4A] text-xs font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1F2E] ">{t.name}</p>
                    <p className="text-xs text-[#64748B] ">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
