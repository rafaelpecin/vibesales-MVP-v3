"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PLANS } from "@/constants/plans";
import type { Plan } from "@/types";

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
    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-indigo-500";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">
          {unlimited ? `${used} / ∞` : `${used} / ${max}`}
        </span>
      </div>
      {!unlimited && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
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
    <span title={url} className="cursor-default font-mono text-xs text-gray-700">
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
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Usage</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your daily usage and scan history.
        </p>
      </div>

      {/* ── Plan summary card ───────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{planName} Plan</h2>
            {constantPlan && (
              <p className="mt-1 text-sm text-gray-500">{constantPlan.description}</p>
            )}
          </div>
          {isUpgradeable && (
            <a
              href="/pricing"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
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
                className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
              >
                {f}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Today's usage progress bars ─────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">Today&apos;s Usage</h2>
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
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Scan History</h2>
          <span className="text-sm text-gray-500">{totalScans} total</span>
        </div>

        {scans.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            No scans yet.{" "}
            <a href="/dashboard" className="text-indigo-600 underline">
              Run your first scan
            </a>
            .
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left">
                    <th className="px-6 py-3 font-medium text-gray-600">Date</th>
                    <th className="px-6 py-3 font-medium text-gray-600">URL</th>
                    <th className="px-6 py-3 font-medium text-gray-600">SEO Score</th>
                    <th className="px-6 py-3 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {scans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-3 text-gray-500">
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
                          className="rounded-md border border-indigo-300 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
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
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
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
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-6 py-5">
          <p className="text-sm font-medium text-indigo-900">
            Need more scans and ad sets?
          </p>
          <p className="mt-1 text-sm text-indigo-700">
            Upgrade to the Pro plan for unlimited scans, ad sets, and priority AI processing.
          </p>
          <a
            href="/pricing"
            className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            View Plans
          </a>
        </div>
      )}
    </main>
  );
}
