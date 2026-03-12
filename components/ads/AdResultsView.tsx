"use client";

import { useState, useEffect, useRef } from "react";
import { Download, Loader2 } from "lucide-react";
import { exportGoogleAds } from "@/lib/csv/googleAdsExport";
import { exportMetaAds } from "@/lib/csv/metaAdsExport";

interface AdResultsViewProps {
  shortTitles: string[];
  longTitles: string[];
  descriptions: string[];
  keywords: string[];
  url: string;
  adSetId: string;
  onGenerateMoreKeywords?: () => void;
}

type Section = "shortTitles" | "longTitles" | "descriptions" | "keywords";

export function AdResultsView({
  shortTitles: initialShortTitles,
  longTitles: initialLongTitles,
  descriptions: initialDescriptions,
  keywords: initialKeywords,
  url,
  onGenerateMoreKeywords,
}: AdResultsViewProps) {
  const [shortTitles, setShortTitles] = useState<string[]>(initialShortTitles);
  const [longTitles, setLongTitles] = useState<string[]>(initialLongTitles);
  const [descriptions, setDescriptions] = useState<string[]>(initialDescriptions);
  const [keywords, setKeywords] = useState<string[]>([...initialKeywords, ""]);

  // Only sync keywords — shortTitles/longTitles/descriptions are handled via key remount
  const prevKeywordsLengthRef = useRef(initialKeywords.length);

  useEffect(() => {
    if (initialKeywords.length > prevKeywordsLengthRef.current) {
      const newOnes = initialKeywords.slice(prevKeywordsLengthRef.current);
      prevKeywordsLengthRef.current = initialKeywords.length;
      setKeywords((prev) => {
        const nonEmpty = prev.filter((k) => k.trim() !== "");
        return [...nonEmpty, ...newOnes, ""];
      });
    }
  }, [initialKeywords.length]);

  const [exportingGoogle, setExportingGoogle] = useState(false);
  const [exportingMeta, setExportingMeta] = useState(false);

  function updateItem(section: Section, index: number, value: string) {
    if (section === "shortTitles") {
      setShortTitles((prev) => prev.map((v, i) => (i === index ? value : v)));
    } else if (section === "longTitles") {
      setLongTitles((prev) => prev.map((v, i) => (i === index ? value : v)));
    } else if (section === "descriptions") {
      setDescriptions((prev) => prev.map((v, i) => (i === index ? value : v)));
    } else {
      setKeywords((prev) => {
        const next = prev.map((v, i) => (i === index ? value : v));
        // Keep a trailing empty row for manual entry
        if (index === prev.length - 1 && value.trim() !== "") {
          next.push("");
        }
        return next;
      });
    }
  }

  function getCurrentData() {
    return {
      url,
      shortTitles,
      longTitles,
      descriptions,
      keywords: keywords.filter((k) => k.trim() !== ""),
    };
  }

  async function handleExportGoogle() {
    setExportingGoogle(true);
    try {
      await exportGoogleAds(getCurrentData());
    } finally {
      setExportingGoogle(false);
    }
  }

  async function handleExportMeta() {
    setExportingMeta(true);
    try {
      await exportMetaAds(getCurrentData());
    } finally {
      setExportingMeta(false);
    }
  }

  const sections: { key: Section; label: string; items: string[] }[] = [
    { key: "shortTitles", label: "Short Titles", items: shortTitles },
    { key: "longTitles", label: "Long Titles", items: longTitles },
    { key: "descriptions", label: "Descriptions", items: descriptions },
    { key: "keywords", label: "Keywords", items: keywords },
  ];

  const maxRows = Math.max(shortTitles.length, longTitles.length, descriptions.length, keywords.length);

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-[12px] border border-[#E2E8F0] shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              {sections.map(({ key, label }) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left font-semibold text-[#1A1F2E] whitespace-nowrap"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRows }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC] transition-colors"
              >
                {sections.map(({ key, items }) => (
                  <td key={key} className="px-3 py-2 align-top">
                    {rowIndex < items.length ? (
                      <input
                        type="text"
                        value={items[rowIndex]}
                        onChange={(e) => updateItem(key, rowIndex, e.target.value)}
                        className="w-full min-w-[160px] rounded-[8px] border border-transparent bg-transparent px-2 py-1 text-[#1A1F2E] focus:border-[#1A7A4A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[rgba(26,122,74,0.3)] transition-all"
                        placeholder={
                          key === "keywords" && rowIndex === items.length - 1
                            ? "Add keyword…"
                            : undefined
                        }
                      />
                    ) : (
                      <span className="block min-w-[160px]" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleExportGoogle}
          disabled={exportingGoogle}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#1A7A4A] text-white font-medium hover:bg-[#155e3a] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {exportingGoogle ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export for Google Ads
        </button>

        <button
          onClick={handleExportMeta}
          disabled={exportingMeta}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#1B4F8A] text-white font-medium hover:bg-[#163f6e] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {exportingMeta ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export for Meta Ads
        </button>

        {onGenerateMoreKeywords && (
          <button
            onClick={onGenerateMoreKeywords}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] border border-[#E2E8F0] text-[#1A1F2E] font-medium hover:bg-[#F8FAFC] transition-colors"
          >
            + More Keywords
          </button>
        )}
      </div>
    </div>
  );
}
