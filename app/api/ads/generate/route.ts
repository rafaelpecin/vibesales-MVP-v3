import { NextRequest, NextResponse } from "next/server";
import { createClient, ensureUserProfile } from "@/lib/supabase/server";
import { createLogger } from "@/lib/logger";
import { buildAdsPrompt } from "@/lib/gemini/adsPrompt";
import { callGeminiForAds } from "@/lib/gemini/client";
import { z } from "zod";

const logger = createLogger("api/ads/generate");

const bodySchema = z.object({
  url: z.string().url("Must be a valid URL"),
  platform: z.enum(["google", "meta", "bing"]),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    logger.warn({ authError }, "Unauthenticated ads generate attempt");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  let body: { url: string; platform: "google" | "meta" | "bing" };
  try {
    const raw = await req.json();
    body = bodySchema.parse(raw);
  } catch (err) {
    logger.warn({ err }, "Invalid request body");
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { url, platform } = body;
  logger.info({ userId: user.id, url, platform }, "ads.start");

  await ensureUserProfile(user);

  // ── Fetch user plan ────────────────────────────────────────────────────────
  const { data: userRow, error: userErr } = await supabase
    .from("users")
    .select("plan_id, plans(max_ads_per_day)")
    .eq("id", user.id)
    .single();

  if (userErr || !userRow) {
    logger.error({ userErr }, "Failed to fetch user plan");
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }

  const maxAds =
    (userRow.plans as { max_ads_per_day: number } | null)?.max_ads_per_day ?? 10;

  // ── Check daily usage ──────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);

  const { data: usageRow } = await supabase
    .from("daily_usage")
    .select("id, ads_used")
    .eq("user_id", user.id)
    .eq("usage_date", today)
    .maybeSingle();

  const adsUsed = usageRow?.ads_used ?? 0;

  if (maxAds > 0 && adsUsed >= maxAds) {
    logger.warn({ userId: user.id, adsUsed, maxAds }, "Daily ads limit exceeded");
    return NextResponse.json(
      { error: "Daily ads limit reached", upgradeUrl: "/pricing" },
      { status: 429 },
    );
  }

  // ── Increment ads_used (upsert with ON CONFLICT) ───────────────────────────
  const { error: upsertErr } = await supabase.from("daily_usage").upsert(
    {
      user_id: user.id,
      usage_date: today,
      ads_used: adsUsed + 10,
      scans_used: usageRow ? undefined : 0,
      keywords_used: usageRow ? undefined : 0,
    },
    { onConflict: "user_id,usage_date" },
  );

  if (upsertErr) {
    logger.error({ upsertErr }, "Failed to upsert daily_usage ads_used");
    return NextResponse.json({ error: "Failed to update usage" }, { status: 500 });
  }

  // ── Call Gemini ────────────────────────────────────────────────────────────
  const geminiStart = Date.now();
  logger.info({ userId: user.id, url, platform }, "gemini.start");

  let adsResult;
  try {
    const prompt = buildAdsPrompt(url, platform);
    adsResult = await callGeminiForAds(prompt);
  } catch (err) {
    logger.error({ err, url, platform }, "Gemini ads call failed");
    return NextResponse.json({ error: "Ad generation failed" }, { status: 502 });
  }

  const geminiDuration = Date.now() - geminiStart;
  logger.info({ duration_ms: geminiDuration }, "gemini.end");

  const [shortTitles, longTitles, descriptions, keywords] = adsResult;

  // ── Save to ad_sets table ──────────────────────────────────────────────────
  logger.info({ userId: user.id, url, platform }, "db.save");

  const { data: adSetRow, error: adSetErr } = await supabase
    .from("ad_sets")
    .insert({
      user_id: user.id,
      url,
      platform,
      short_titles: shortTitles,
      long_titles: longTitles,
      descriptions,
      keywords,
    })
    .select("id")
    .single();

  if (adSetErr || !adSetRow) {
    logger.error({ adSetErr }, "Failed to save ad set to DB");
    return NextResponse.json({ error: "Failed to save ad set" }, { status: 500 });
  }

  logger.info({ userId: user.id, adSetId: adSetRow.id, url, platform }, "ads.complete");

  return NextResponse.json({
    success: true,
    data: { shortTitles, longTitles, descriptions, keywords },
    adSetId: adSetRow.id,
  });
}
