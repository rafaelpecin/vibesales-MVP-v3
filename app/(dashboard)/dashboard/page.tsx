import { redirect } from "next/navigation";
import { createClient, ensureUserProfile } from "@/lib/supabase/server";
import { UrlInputForm } from "@/components/seo/UrlInputForm";
import { UsageIndicator } from "@/components/layout/UsageIndicator";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url: initialUrl } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await ensureUserProfile(user);

  const firstName = user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "there";

  const { data: userRow } = await supabase
    .from("users")
    .select("plan_id, plans(max_scans_per_day)")
    .eq("id", user.id)
    .single();

  const maxScans =
    (userRow?.plans as { max_scans_per_day: number } | null)?.max_scans_per_day ?? 1;

  const today = new Date().toISOString().slice(0, 10);
  const { data: usageRow } = await supabase
    .from("daily_usage")
    .select("scans_used")
    .eq("user_id", user.id)
    .eq("usage_date", today)
    .maybeSingle();

  const scansUsed = usageRow?.scans_used ?? 0;

  return (
    <main className="px-8 py-8 max-w-3xl" >
      <PageHeader
        title={`Welcome back, ${firstName}!`}
        subtitle="Paste a URL to run an AI-powered SEO audit in seconds."
      />

      <div className="mt-6 rounded-[12px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
        <UrlInputForm scansUsed={scansUsed} maxScans={maxScans} initialUrl={initialUrl ?? ""} />
      </div>
    </main>
  );
}
