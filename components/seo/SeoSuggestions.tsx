"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeoSuggestionsProps {
  suggestions: [string, string[]][];
}

export function SeoSuggestions({ suggestions }: SeoSuggestionsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {suggestions.map(([topic, items], idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="border border-[#E2E8F0] rounded-[8px] overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left bg-white hover:bg-[#F8FAFC] transition-all duration-150"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
            >
              <span className="font-medium text-[#1A1F2E]">{topic}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-[#64748B] transition-transform duration-200 shrink-0",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-1 bg-[#F8FAFC] border-t border-[#E2E8F0]">
                <ul className="space-y-2">
                  {items.map((suggestion, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2 text-sm text-[#1A1F2E]">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#1A7A4A] shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
