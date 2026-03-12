import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdGeneratorForm } from "@/components/ads/AdGeneratorForm";
import { UsageIndicator } from "@/components/layout/UsageIndicator";
import { PageHeader } from "@/components/layout/PageHeader";
import { Info } from "lucide-react";

interface AdsPageProps {
  searchParams: Promise<{ url?: string; scanId?: string; scan_id?: string }>;
}

export default async function AdsPage({ searchParams }: AdsPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const url = params.url ?? "";
  const scanId = params.scanId ?? params.scan_id ?? "";

  return (
    <main className="px-8 py-8 max-w-5xl">
      <PageHeader
        title="Ad Generator"
        subtitle="Create high-converting ad copy for Google, Meta, or Bing from any URL."
        backHref="/dashboard"
        backLabel="SEO Scan"
      />

      <UsageIndicator />

      {scanId && (
        <div className="vs-alert-info mt-4 flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1B4F8A]" />
          <span>Generating ads based on your SEO scan results.</span>
        </div>
      )}

      <div className="mt-6 rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
        <AdGeneratorForm initialUrl={url} />
      </div>
    </main>
  );
}
