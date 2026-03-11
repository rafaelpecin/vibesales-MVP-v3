import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdGeneratorForm } from "@/components/ads/AdGeneratorForm";
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
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Generate Ads</h1>
        <p className="mt-2 text-gray-500">
          Generate AI-powered ad copy for Google, Meta, or Bing from any URL.
        </p>
      </div>

      {scanId && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          <span>Generating ads based on your SEO scan.</span>
        </div>
      )}

      <AdGeneratorForm initialUrl={url} />
    </main>
  );
}
