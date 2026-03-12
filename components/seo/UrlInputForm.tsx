"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Search } from "lucide-react";

interface UrlInputFormProps {
  scansUsed: number;
  maxScans: number;
  initialUrl?: string;
}

export function UrlInputForm({ scansUsed, maxScans, initialUrl = "" }: UrlInputFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limitReached = maxScans > 0 && scansUsed >= maxScans;

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || limitReached) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      router.push(
        `/dashboard/scan?id=${data.scan_id}&url=${encodeURIComponent(url.trim())}`,
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSkipToAds() {
    if (!url.trim()) return;
    router.push(`/ads?url=${encodeURIComponent(url.trim())}`);
  }

  return (
    <form onSubmit={handleScan} className="space-y-4">
      <div className="relative">
        <input
          type="url"
          placeholder="https://yourwebsite.com/page"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading || limitReached}
          required
          className="w-full h-12 px-4 rounded-[8px] border border-[#E2E8F0] bg-white text-[14px] text-[#1A1F2E] placeholder:text-[#64748B] focus:outline-none focus:border-[#1A7A4A] focus:ring-[3px] focus:ring-[rgba(26,122,74,0.12)] disabled:bg-[#F1F5F9] disabled:cursor-not-allowed transition-all duration-150"
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="submit"
          disabled={loading || limitReached || !url.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#1A7A4A] text-white text-sm font-medium hover:bg-[#155e3a] hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
        >
          {loading ? "Scanning…" : "Check SEO"}
        </button>

        <button
          type="button"
          onClick={handleSkipToAds}
          disabled={!url.trim() || loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] border border-[#1B4F8A] text-[#1B4F8A] text-sm font-medium hover:bg-[rgba(27,79,138,0.06)] hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
        >
          Skip to Ads
          <ArrowRight className="w-4 h-4" />
        </button>

        <span className="ml-auto text-sm text-[#64748B]">
          Scans:{" "}
          <span className="font-medium text-[#1A1F2E]">
            {scansUsed}/{maxScans === 0 ? "∞" : maxScans}
          </span>{" "}
          today
        </span>
      </div>

      {limitReached && (
        <div className="vs-alert-warning flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            You&apos;ve reached your daily scan limit.{" "}
            <a href="/dashboard/settings" className="font-medium underline">
              Upgrade your plan
            </a>{" "}
            to continue scanning.
          </span>
        </div>
      )}

      {error && (
        <div className="vs-alert-error flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}
    </form>
  );
}
