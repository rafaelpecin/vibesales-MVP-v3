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
    <div className="space-y-6 print:space-y-4">
      {/* Score card */}
      <div className="rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
        <p className="text-xs text-[#64748B] mb-4 truncate">{url}</p>
        <SeoScoreGauge
          currentScore={result.current_score[0]}
          projectedScore={result.projected_score[0]}
        />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-3 text-sm text-[#64748B]">
            <span className="font-medium text-[#1A1F2E]">Current: </span>
            {result.current_score[1]}
          </div>
          <div className="rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-3 text-sm text-[#64748B]">
            <span className="font-medium text-[#1A1F2E]">Projected: </span>
            {result.projected_score[1]}
          </div>
        </div>
      </div>

      {result.suggestions.length > 0 && (
        <div className="rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
          <h2 className="text-base font-semibold text-[#1A1F2E] mb-4">Improvement Suggestions</h2>
          <SeoSuggestions suggestions={result.suggestions} />
        </div>
      )}

      {result.keywords.length > 0 && (
        <div className="rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
          <h2 className="text-base font-semibold text-[#1A1F2E] mb-3">Keywords</h2>
          <div className="flex flex-wrap gap-2">
            {result.keywords.map((kw, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-[999px] bg-[#f0fdf8] border border-[#bbf7d0] text-[#1A7A4A] text-sm font-medium"
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
          className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] border border-[#E2E8F0] text-[#1A1F2E] text-sm font-medium hover:bg-[#F8FAFC] transition-all duration-150"
        >
          <Printer className="w-4 h-4" />
          Print / Save
        </button>

        <button
          type="button"
          onClick={handleGenerateAds}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#1A7A4A] text-white text-sm font-medium hover:bg-[#155e3a] hover:-translate-y-px transition-all duration-150"
        >
          Generate Ads from this page
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
