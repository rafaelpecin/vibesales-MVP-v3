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
          className="w-full h-14 px-4 pr-12 rounded-xl border border-gray-300 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="submit"
          disabled={loading || limitReached || !url.trim()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Search className="w-4 h-4" />
          {loading ? "Scanning…" : "Check SEO"}
        </button>

        <button
          type="button"
          onClick={handleSkipToAds}
          disabled={!url.trim() || loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Skip to Ads
          <ArrowRight className="w-4 h-4" />
        </button>

        <span className="ml-auto text-sm text-gray-500">
          Scans:{" "}
          <span className="font-medium text-gray-700">
            {scansUsed}/{maxScans === 0 ? "∞" : maxScans}
          </span>{" "}
          today
        </span>
      </div>

      {limitReached && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
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
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}
    </form>
  );
}
