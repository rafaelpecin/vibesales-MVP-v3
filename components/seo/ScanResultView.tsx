"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Printer, ArrowRight } from "lucide-react";
import { SeoScoreGauge } from "@/components/seo/SeoScoreGauge";
import { SeoSuggestions } from "@/components/seo/SeoSuggestions";
import type { SeoResult } from "@/lib/gemini/seoPrompt";
import { ExternalLink } from "lucide-react";

interface ScanResultViewProps {
  scanId: string;
  url: string;
  result: SeoResult;
}

export function ScanResultView({ scanId, url, result }: ScanResultViewProps) {
  const router = useRouter();
  const [printing, setPrinting] = useState(false);

  function handlePrint() {
    setPrinting(true);
    const handler = () => {
      setPrinting(false);
      window.removeEventListener("afterprint", handler);
    };
    window.addEventListener("afterprint", handler);
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  }

  function handleGenerateAds() {
    const params = new URLSearchParams({
      url,
      scan_id: scanId,
      keywords: result.keywords.join(","),
    });
    router.push(`/ads?${params.toString()}`);
  }

  return (
    <div className="space-y-6 print:space-y-4 spot-light">
      {/* Score card */}
      <div className="rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
        <a href={url} target="_blank"><h2 className="spot-light">{url} <ExternalLink size={20} /></h2></a>
        <SeoScoreGauge
          currentScore={result.current_score[0]}
          projectedScore={result.projected_score[0]}
          currentAnalysis={result.current_score[1]}
          projectedAnalysis={result.projected_score[1]}
        />
      </div>

      {result.suggestions.length > 0 && (
        <div className="rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
          <h2 className="text-base font-semibold text-[#1A1F2E] mb-4">Improvement Suggestions</h2>
          <SeoSuggestions suggestions={result.suggestions} allOpen={printing} />
        </div>
      )}

      {result.keywords.length > 0 && (
        <div className="rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
          <h2 className="text-base font-semibold text-[#1A1F2E] mb-3">Keywords</h2>
          <div className="flex flex-wrap gap-2 spot-light">
            {result.keywords.map((kw, i) => {
              const t = result.keywords.length > 1 ? i / (result.keywords.length - 1) : 0;
              const r = Math.round(26 + (27 - 26) * t);
              const g = Math.round(122 + (79 - 122) * t);
              const b = Math.round(74 + (138 - 74) * t);
              const color = `rgb(${r},${g},${b})`;
              return (
                <span
                  key={i}
                  style={{ border: `1.5px solid ${color}`, borderRadius: "8px", padding: "2px 4px", margin: "2px  2px", color, background: "transparent" }}
                  className="px-3 py-1 rounded-[999px] text-sm font-medium"
                >
                  {kw}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <br></br>
      <div className="flex items-center gap-3 flex-wrap print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] border border-[#E2E8F0] text-[#1A1F2E] text-sm font-medium hover:bg-[#F8FAFC] transition-all duration-150"
        >
          <Printer size={15} className="w-4 h-4" />
          &nbsp; Print / Save &nbsp;
        </button>

        &nbsp;

        <button
          type="button"
          onClick={handleGenerateAds}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#1A7A4A] text-white text-sm font-medium hover:bg-[#155e3a] hover:-translate-y-px transition-all duration-150"
        >
          Generate Ads For Your Page
          <ArrowRight size={15} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
