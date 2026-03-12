"use client";

import { useEffect, useState } from "react";
import { BarChart2, Sparkles, Tag } from "lucide-react";
import Link from "next/link";

interface UsageData {
  scansUsed: number;
  maxScans: number;
  adsUsed: number;
  maxAds: number;
  keywordsUsed: number;
  maxKeywords: number;
}

function Meter({
  icon: Icon,
  label,
  used,
  max,
}: {
  icon: React.ElementType;
  label: string;
  used: number;
  max: number;
}) {
  const unlimited = max === 0;
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / max) * 100));
  const barColor =
    pct >= 90 ? "#EF4444" : pct >= 70 ? "#F59E0B" : "#1A7A4A";
  const textColor =
    pct >= 90 ? "#991B1B" : pct >= 70 ? "#92400E" : "#1A7A4A";
  const atLimit = !unlimited && used >= max;

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] uppercase tracking-wide">
          <Icon size={12} />
          {label}
        </span>
        <span
          className="text-xs font-semibold tabular-nums"
          style={{ color: atLimit ? "#EF4444" : textColor }}
        >
          {used}
          <span className="text-[#64748B] font-normal">
            /{unlimited ? "∞" : max}
          </span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#E2E8F0] overflow-hidden">
        {!unlimited && (
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        )}
        {unlimited && (
          <div
            className="h-full rounded-full"
            style={{ width: "100%", background: "linear-gradient(90deg, #1A7A4A 0%, #1B4F8A 100%)", opacity: 0.3 }}
          />
        )}
      </div>
    </div>
  );
}

export function UsageIndicator() {
  const [data, setData] = useState<UsageData | null>(null);

  useEffect(() => {
    fetch("/api/user/usage")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setData(d))
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="rounded-[10px] border border-[#E2E8F0] bg-white px-5 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] animate-pulse">
        <div className="flex gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 space-y-2">
              <div className="h-3 w-20 rounded bg-[#E2E8F0]" />
              <div className="h-1.5 w-full rounded-full bg-[#E2E8F0]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const anyAtLimit =
    (data.maxScans > 0 && data.scansUsed >= data.maxScans) ||
    (data.maxAds > 0 && data.adsUsed >= data.maxAds);

  return (
    <div className="rounded-[10px] border border-[#E2E8F0] bg-white px-5 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-5 flex-wrap">
        <div className="flex flex-1 items-center gap-5 min-w-0">
          <Meter icon={BarChart2} label="Scans" used={data.scansUsed} max={data.maxScans} />
          <div className="w-px h-8 bg-[#E2E8F0] shrink-0" />
          <Meter icon={Sparkles} label="Ads" used={data.adsUsed} max={data.maxAds} />
          <div className="w-px h-8 bg-[#E2E8F0] shrink-0" />
          <Meter icon={Tag} label="Keywords" used={data.keywordsUsed} max={data.maxKeywords} />
        </div>
        {anyAtLimit && (
          <Link
            href="/pricing"
            className="shrink-0 rounded-[6px] bg-[#1A7A4A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#155e3a] transition-all duration-150"
          >
            Upgrade
          </Link>
        )}
      </div>
    </div>
  );
}
