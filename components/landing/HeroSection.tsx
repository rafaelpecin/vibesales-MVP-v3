"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, BarChart2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const steps = [
  {
    icon: Link2,
    label: "Paste your URL",
  },
  {
    icon: BarChart2,
    label: "Get your SEO score & improvement suggestions",
  },
  {
    icon: Sparkles,
    label: "Generate AI-powered ads",
  },
];

/**
 * Landing page hero with URL input that routes authenticated users to /dashboard
 * and unauthenticated users to /login, preserving the entered URL as a param.
 */
export function HeroSection() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function handleAnalyze() {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter your website URL.");
      return;
    }
    // Accept URLs with or without protocol prefix.
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      new URL(normalized);
    } catch {
      setError("Please enter a valid URL (e.g. https://example.com).");
      return;
    }
    setError("");
    const encoded = encodeURIComponent(normalized);
    if (user) {
      router.push(`/dashboard?url=${encoded}`);
    } else {
      router.push(`/login?redirect=/dashboard&url=${encoded}`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleAnalyze();
  }

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-[#f0fdf8] via-white to-[#eff6ff]  pt-24 pb-20 px-4">
      <div className="relative mx-auto max-w-3xl text-center hero-banner">&nbsp;
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#1A1F2E] sm:text-6xl title">
          Rank Higher.{" "}
          <span className="bg-gradient-to-r from-[#1A7A4A] to-[#1B4F8A] bg-clip-text text-transparent">
            Sell More.
          </span>{" "}
          Powered by AI.
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-[#64748B]  sm:text-xl">
          Get an instant AI-driven SEO audit and generate high-converting ad copy for Google,
          Meta, and Bing — all in seconds. No agency required.
        </p>

        {/* URL input */}
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="spot-light hero-url" style={{ border: "4px solid #e52799"}}><b style={{ fontSize: "10pt",  color: "silver"}}>|</b>
              <Input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="https://yourwebsite.com"
            className="hero-url-input"
            aria-label="Website URL"
          />
          </div>
          <div style={{ flex: 1, width: "30%" }}>
            &nbsp;
          <Button
            size="lg"
            disabled={loading}
            onClick={handleAnalyze}
            style={{ width: "180px", height: "50px", alignItems: "center", justifyContent: "center"}}
            className="h-12 w-full gap-2 rounded-[8px] bg-[#1A7A4A] px-6 text-base font-semibold text-white shadow-sm hover:bg-[#155e3a] hover:-translate-y-px transition-all duration-150 sm:w-auto"
          >
            Analyze My Site
            <ArrowRight size={15} className="h-4 w-4" />
          </Button>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        {/* Step indicators */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.label} className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dcfce7] ring-4 ring-white ">
                <step.icon className="h-5 w-5 text-[#1A7A4A]" />
              </div>
              <p className="text-sm font-medium text-[#1A1F2E] ">
                <span className="mr-1 font-bold text-[#1A7A4A]">
                  {i + 1}.
                </span>
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
