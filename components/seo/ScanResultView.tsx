"use client";

import { useRouter } from "next/navigation";
import { Printer, ArrowRight } from "lucide-react";
import { SeoScoreGauge } from "@/components/seo/SeoScoreGauge";
import { SeoSuggestions } from "@/components/seo/SeoSuggestions";
import type { SeoResult } from "@/lib/gemini/seoPrompt";

interface ScanResultViewProps {
  scanId: string;
  url: string;
  result: SeoResult;
}

export function ScanResultView({ scanId, url, result }: ScanResultViewProps) {
  const router = useRouter();

  function handleGenerateAds() {
    const params = new URLSearchParams({
      url,
      scan_id: scanId,
      keywords: result.keywords.join(","),
    });
    router.push(`/ads?${params.toString()}`);
  }

  return (
    <div className="space-y-8 print:space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs text-gray-400 mb-4 truncate">{url}</p>
        <SeoScoreGauge
          currentScore={result.current_score[0]}
          projectedScore={result.projected_score[0]}
        />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Current: </span>
            {result.current_score[1]}
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Projected: </span>
            {result.projected_score[1]}
          </div>
        </div>
      </div>

      {result.suggestions.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Improvement Suggestions</h2>
          <SeoSuggestions suggestions={result.suggestions} />
        </div>
      )}

      {result.keywords.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Keywords</h2>
          <div className="flex flex-wrap gap-2">
            {result.keywords.map((kw, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print / Save
        </button>

        <button
          type="button"
          onClick={handleGenerateAds}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Generate Ads from this page
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
