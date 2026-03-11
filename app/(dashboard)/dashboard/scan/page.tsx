import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ScanResultView } from "@/components/seo/ScanResultView";
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
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div className="h-4 w-48 rounded bg-gray-200" />
        <div className="mx-auto h-48 w-48 rounded-full bg-gray-200" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 rounded-lg bg-gray-200" />
          <div className="h-12 rounded-lg bg-gray-200" />
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
        <div className="h-5 w-40 rounded bg-gray-200" />
        <div className="h-16 rounded-lg bg-gray-200" />
        <div className="h-16 rounded-lg bg-gray-200" />
        <div className="h-16 rounded-lg bg-gray-200" />
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
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">SEO Analysis</h1>
      <Suspense fallback={<ScanSkeleton />}>
        <ScanResult scanId={scanId as string} />
      </Suspense>
    </main>
  );
}
