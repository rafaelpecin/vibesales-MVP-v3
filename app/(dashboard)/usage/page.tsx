"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PLANS } from "@/constants/plans";
import type { Plan } from "@/types";
import { UsageIndicator } from "@/components/layout/UsageIndicator";
import { PageHeader } from "@/components/layout/PageHeader";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DailyUsage {
  scans_used: number;
  ads_used: number;
  keywords_used: number;
}

interface ScanRow {
  id: string;
  url: string;
  current_score: number | null;
  created_at: string;
}

interface UserRow {
  plans: {
    id: string;
    name: string;
    max_scans_per_day: number;
    max_ads_per_day: number;
    max_keywords_per_day: number;
  } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROWS_PER_PAGE = 10;

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-gray-400">N/A</span>;
  const colour =
    score >= 80
      ? "bg-green-100 text-green-700"
      : score >= 50
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${colour}`}>
      {score}
    </span>
  );
}

function UsageBar({
  label,
  used,
  max,
}: {
  label: string;
  used: number;
  max: number;
}) {
  const unlimited = max === 0; // 0 in the DB means unlimited for pro-tier
  const pct = unlimited || max === 0 ? 0 : Math.min(100, Math.round((used / max) * 100));
  const barColour =
    pct >= 90 ? "bg-[#EF4444]" : pct >= 70 ? "bg-[#F59E0B]" : "bg-[#1A7A4A]";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-[#1A1F2E]">{label}</span>
        <span className="text-[#64748B]">
          {unlimited ? `${used} / ∞` : `${used} / ${max}`}
        </span>
      </div>
      {!unlimited && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
          <div
            className={`h-2 rounded-full transition-all ${barColour}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function TruncatedUrl({ url }: { url: string }) {
  const display = url.length > 50 ? url.slice(0, 50) + "…" : url;
  return (
    <span title={url} className="cursor-default font-mono text-xs text-[#1A1F2E]">
      {display}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function UsagePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userRow, setUserRow] = useState<UserRow | null>(null);
  const [usage, setUsage] = useState<DailyUsage>({ scans_used: 0, ads_used: 0, keywords_used: 0 });
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalScans, setTotalScans] = useState(0);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const today = new Date().toISOString().slice(0, 10);

      // Run queries in parallel
      const [userRes, usageRes, scanCountRes] = await Promise.all([
        supabase
          .from("users")
          .select(
            "plans(id, name, max_scans_per_day, max_ads_per_day, max_keywords_per_day)",
          )
          .eq("id", user.id)
          .single(),
        supabase
          .from("daily_usage")
          .select("scans_used, ads_used, keywords_used")
          .eq("user_id", user.id)
          .eq("usage_date", today)
          .maybeSingle(),
        supabase
          .from("url_scans")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      if (userRes.data) setUserRow(userRes.data as UserRow);
      if (usageRes.data)
        setUsage(usageRes.data as DailyUsage);
      if (scanCountRes.count !== null) setTotalScans(scanCountRes.count);

      setLoading(false);
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch scan history page
  useEffect(() => {
    async function loadPage() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const from = (page - 1) * ROWS_PER_PAGE;
      const to = from + ROWS_PER_PAGE - 1;

      const { data } = await supabase
        .from("url_scans")
        .select("id, url, current_score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, to);

      setScans((data as ScanRow[]) ?? []);
    }

    if (!loading) loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, loading]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const planName = userRow?.plans?.name ?? "Free";
  const planLimits = userRow?.plans ?? {
    max_scans_per_day: 1,
    max_ads_per_day: 1,
    max_keywords_per_day: 5,
  };

  // Plan details from constants (for limits description)
  const constantPlan: Plan | undefined = PLANS.find(
    (p) => p.name.toLowerCase() === planName.toLowerCase(),
  );

  const isUpgradeable = ["free", "start"].includes(planName.toLowerCase());
  const totalPages = Math.ceil(totalScans / ROWS_PER_PAGE);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="px-8 py-8 max-w-5xl">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-[12px] bg-[#F1F5F9]" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="px-8 py-8 max-w-5xl space-y-6">
      <PageHeader
        title="Usage"
        subtitle="Today's activity and full scan history."
      />

      <UsageIndicator />

      {/* ── Plan summary card ───────────────────────────────────────────── */}
      <section className="rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#1A1F2E]">{planName} Plan</h2>
            {constantPlan && (
              <p className="mt-1 text-sm text-[#64748B]">{constantPlan.description}</p>
            )}
          </div>
          {isUpgradeable && (
            <a
              href="/pricing"
              className="rounded-lg bg-[#1A7A4A] px-4 py-2 text-sm font-medium text-white hover:bg-[#155e3a]"
            >
              Upgrade Plan
            </a>
          )}
        </div>

        {constantPlan && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {constantPlan.features.map((f) => (
              <li
                key={f}
                className="rounded-full bg-[#f0fdf8] px-3 py-1 text-xs font-medium text-[#1A7A4A]"
              >
                {f}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Today's usage progress bars ─────────────────────────────────── */}
      <section className="rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
        <h2 className="mb-5 text-lg font-semibold text-[#1A1F2E]">Today&apos;s Usage</h2>
        <div className="space-y-4">
          <UsageBar
            label="Scans"
            used={usage.scans_used}
            max={planLimits.max_scans_per_day}
          />
          <UsageBar
            label="Ads Generated"
            used={usage.ads_used}
            max={planLimits.max_ads_per_day}
          />
          <UsageBar
            label="Keywords"
            used={usage.keywords_used}
            max={planLimits.max_keywords_per_day}
          />
        </div>
      </section>

      {/* ── Scan history table ──────────────────────────────────────────── */}
      <section className="rounded-[12px] border border-[#E2E8F0] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#1A1F2E]">Scan History</h2>
          <span className="text-sm text-[#64748B]">{totalScans} total</span>
        </div>

        {scans.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[#64748B]">
            No scans yet.{" "}
            <a href="/dashboard" className="text-[#1A7A4A] underline">
              Run your first scan
            </a>
            .
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left">
                    <th className="px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-[0.05em]">Date</th>
                    <th className="px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-[0.05em]">URL</th>
                    <th className="px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-[0.05em]">Score</th>
                    <th className="px-6 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-[0.05em]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8FAFC]">
                  {scans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-[rgba(26,122,74,0.03)] transition-colors duration-100">
                      <td className="whitespace-nowrap px-6 py-3 text-[#64748B]">
                        {new Date(scan.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-3">
                        <TruncatedUrl url={scan.url} />
                      </td>
                      <td className="px-6 py-3">
                        <ScoreBadge score={scan.current_score} />
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard?url=${encodeURIComponent(scan.url)}`,
                            )
                          }
                          className="rounded-md border border-[#bbf7d0] px-2.5 py-1 text-xs font-medium text-[#1A7A4A] hover:bg-[#f0fdf8]"
                        >
                          Re-scan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#E2E8F0] px-6 py-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-sm font-medium text-[#1A1F2E] hover:bg-[#F8FAFC] disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-[#64748B]">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-sm font-medium text-[#1A1F2E] hover:bg-[#F8FAFC] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Upgrade CTA (bottom) ────────────────────────────────────────── */}
      {isUpgradeable && (
        <div className="rounded-[12px] border border-[#bbf7d0] bg-[#f0fdf8] px-6 py-5">
          <p className="text-sm font-medium text-[#104832]">
            Need more scans and ad sets?
          </p>
          <p className="mt-1 text-sm text-[#1A7A4A]">
            Upgrade to the Pro plan for unlimited scans, ad sets, and priority AI processing.
          </p>
          <a
            href="/pricing"
            className="mt-3 inline-block rounded-lg bg-[#1A7A4A] px-4 py-2 text-sm font-medium text-white hover:bg-[#155e3a]"
          >
            View Plans
          </a>
        </div>
      )}
    </main>
  );
}
