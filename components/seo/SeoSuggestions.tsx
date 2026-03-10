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
          <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left bg-white hover:bg-gray-50 transition-colors"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
            >
              <span className="font-medium text-gray-800">{topic}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-1 bg-gray-50 border-t border-gray-100">
                <ul className="space-y-2">
                  {items.map((suggestion, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
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
