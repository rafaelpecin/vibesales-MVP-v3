import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ScanResultView } from "@/components/seo/ScanResultView";
import { UsageIndicator } from "@/components/layout/UsageIndicator";
import { PageHeader } from "@/components/layout/PageHeader";
import type { SeoResult } from "@/lib/gemini/seoPrompt";

interface ScanPageProps {
  searchParams: Promise<{ id?: string }>;
}

async function ScanResult({ scanId }: { scanId: string }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: scan } = await supabase
    .from("url_scans")
    .select("id, user_id, url, current_score, projected_score, seo_result")
    .eq("id", scanId)
    .single();

  if (!scan || scan.user_id !== user.id) {
    redirect("/dashboard");
  }

  const result = scan.seo_result as SeoResult;

  return (
    <ScanResultView
      scanId={scan.id}
      url={scan.url}
      result={result}
    />
  );
}

function ScanSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] space-y-4">
        <div className="h-4 w-48 rounded-[6px] bg-[#E2E8F0]" />
        <div className="mx-auto h-48 w-48 rounded-full bg-[#E2E8F0]" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 rounded-[8px] bg-[#E2E8F0]" />
          <div className="h-12 rounded-[8px] bg-[#E2E8F0]" />
        </div>
      </div>
      <div className="rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] space-y-3">
        <div className="h-5 w-40 rounded-[6px] bg-[#E2E8F0]" />
        <div className="h-16 rounded-[8px] bg-[#E2E8F0]" />
        <div className="h-16 rounded-[8px] bg-[#E2E8F0]" />
        <div className="h-16 rounded-[8px] bg-[#E2E8F0]" />
      </div>
    </div>
  );
}

export default async function ScanPage({ searchParams }: ScanPageProps) {
  const { id: scanId } = await searchParams;

  if (!scanId) {
    redirect("/dashboard");
  }

  return (
    <main className="px-8 py-8 max-w-3xl">
      <PageHeader
        title="SEO Analysis"
        subtitle="AI-powered audit results for your page."
        backHref="/dashboard"
        backLabel="New scan"
      />

      <UsageIndicator />

      <div className="mt-6">
        <Suspense fallback={<ScanSkeleton />}>
          <ScanResult scanId={scanId as string} />
        </Suspense>
      </div>
    </main>
  );
}
