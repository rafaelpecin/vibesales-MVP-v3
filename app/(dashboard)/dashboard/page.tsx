import { redirect } from "next/navigation";
import { createClient, ensureUserProfile } from "@/lib/supabase/server";
import { UrlInputForm } from "@/components/seo/UrlInputForm";

export default async function DashboardPage() {
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
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {firstName}!
        </h1>
        <p className="mt-2 text-gray-500">
          Enter a URL below to analyse its SEO health with AI.
        </p>
      </div>

      <UrlInputForm scansUsed={scansUsed} maxScans={maxScans} />
    </main>
  );
}
