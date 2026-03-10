import { HeroSection } from "@/components/landing/HeroSection";
import { SeoBenefits } from "@/components/landing/SeoBenefits";
import { AiAdsBenefits } from "@/components/landing/AiAdsBenefits";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata = {
  title: "Vibe Sales — AI SEO & Ad Generator",
  description:
    "Rank higher and sell more with instant AI-powered SEO audits and ad copy for Google, Meta, and Bing.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <SeoBenefits />
      <AiAdsBenefits />
      <HowItWorks />
      <Testimonials />
      <PricingPreview />
      <LandingFooter />
    </main>
  );
}
