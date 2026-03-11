import { NextResponse } from "next/server";
import { createClient, ensureUserProfile } from "@/lib/supabase/server";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api/user/usage");

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureUserProfile(user);

  const { data: userRow, error: userErr } = await supabase
    .from("users")
    .select("plan_id, plans(max_ads_per_day, max_scans_per_day, max_keywords_per_day)")
    .eq("id", user.id)
    .single();

  if (userErr || !userRow) {
    logger.error({ userErr }, "Failed to fetch user plan");
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }

  const plans = userRow.plans as {
    max_ads_per_day: number;
    max_scans_per_day: number;
    max_keywords_per_day: number;
  } | null;

  const maxAds = plans?.max_ads_per_day ?? 10;
  const maxScans = plans?.max_scans_per_day ?? 1;
  const maxKeywords = plans?.max_keywords_per_day ?? 0;

  const today = new Date().toISOString().slice(0, 10);

  const { data: usageRow } = await supabase
    .from("daily_usage")
    .select("ads_used, scans_used, keywords_used")
    .eq("user_id", user.id)
    .eq("usage_date", today)
    .maybeSingle();

  return NextResponse.json({
    adsUsed: usageRow?.ads_used ?? 0,
    maxAds,
    scansUsed: usageRow?.scans_used ?? 0,
    maxScans,
    keywordsUsed: usageRow?.keywords_used ?? 0,
    maxKeywords,
  });
}
