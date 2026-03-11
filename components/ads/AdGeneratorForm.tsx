"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Zap } from "lucide-react";
import Link from "next/link";
import { AdResultsView } from "@/components/ads/AdResultsView";

type Platform = "google" | "meta" | "bing";

interface AdsData {
  shortTitles: string[];
  longTitles: string[];
  descriptions: string[];
  keywords: string[];
}

interface AdResultEntry extends AdsData {
  adSetId: string;
}

interface UsageData {
  adsUsed: number;
  maxAds: number;
}

interface AdGeneratorFormProps {
  initialUrl?: string;
}

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "google", label: "Google Ads" },
  { value: "meta", label: "Meta Ads" },
  { value: "bing", label: "Bing Ads" },
];

export function AdGeneratorForm({ initialUrl = "" }: AdGeneratorFormProps) {
  const [url, setUrl] = useState(initialUrl);
  const [platform, setPlatform] = useState<Platform>("google");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AdResultEntry[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loadingMoreKeywords, setLoadingMoreKeywords] = useState(false);

  useEffect(() => {
    fetchUsage();
  }, []);

  async function fetchUsage() {
    try {
      const res = await fetch("/api/user/usage");
      if (!res.ok) return;
      const data = await res.json();
      setUsage({ adsUsed: data.adsUsed ?? 0, maxAds: data.maxAds ?? 0 });
    } catch {
      // Non-critical — usage counter is best-effort
    }
  }

  const limitReached = usage !== null && usage.maxAds > 0 && usage.adsUsed >= usage.maxAds;

  async function generate() {
    if (!url.trim() || limitReached) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ads/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), platform }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setResults((prev) => [
        ...prev,
        {
          shortTitles: data.data.shortTitles,
          longTitles: data.data.longTitles,
          descriptions: data.data.descriptions,
          keywords: data.data.keywords,
          adSetId: data.adSetId,
        },
      ]);

      // Refresh usage counter after generation
      fetchUsage();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateMoreKeywords(resultIndex: number) {
    const current = results[resultIndex];
    if (!current) return;

    setLoadingMoreKeywords(true);
    try {
      const res = await fetch("/api/ads/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          currentKeywords: current.keywords,
        }),
      });

      if (!res.ok) return;
      const data = await res.json();
      const newKeywords: string[] = data.keywords ?? [];

      setResults((prev) =>
        prev.map((entry, i) =>
          i === resultIndex
            ? { ...entry, keywords: [...entry.keywords, ...newKeywords] }
            : entry,
        ),
      );
    } finally {
      setLoadingMoreKeywords(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    generate();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* URL input */}
        <div>
          <label htmlFor="ads-url" className="block text-sm font-medium text-gray-700 mb-1.5">
            Website URL
          </label>
          <input
            id="ads-url"
            type="url"
            placeholder="https://yourwebsite.com/page"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            required
            className="w-full h-12 px-4 rounded-xl border border-gray-300 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Platform tabs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform</label>
          <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-100 p-1 w-fit">
            {PLATFORMS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPlatform(value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  platform === value
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Usage counter */}
        {usage !== null && (
          <p className="text-sm text-gray-500">
            Ads generated today:{" "}
            <span className={`font-medium ${limitReached ? "text-red-500" : "text-gray-700"}`}>
              {usage.adsUsed} / {usage.maxAds > 0 ? usage.maxAds : "∞"}
            </span>
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit / limit reached */}
        {limitReached ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Daily limit reached.</span>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Upgrade
            </Link>
          </div>
        ) : (
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating…
              </>
            ) : results.length === 0 ? (
              "Generate 10 Ads"
            ) : (
              "Generate 10 More"
            )}
          </button>
        )}
      </form>

      {/* Results */}
      {results.map((entry, index) => (
        <div key={entry.adSetId} className="space-y-3">
          {results.length > 1 && (
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Batch {index + 1}
            </h3>
          )}
          <AdResultsView
            shortTitles={entry.shortTitles}
            longTitles={entry.longTitles}
            descriptions={entry.descriptions}
            keywords={entry.keywords}
            url={url}
            adSetId={entry.adSetId}
            onGenerateMoreKeywords={
              loadingMoreKeywords
                ? undefined
                : () => handleGenerateMoreKeywords(index)
            }
          />
        </div>
      ))}
    </div>
  );
}
