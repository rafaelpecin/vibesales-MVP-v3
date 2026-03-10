import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLogger } from "@/lib/logger";
import { buildSeoPrompt } from "@/lib/gemini/seoPrompt";
import { callGeminiForSeo } from "@/lib/gemini/client";
import { z } from "zod";

const logger = createLogger("api/scan");

const bodySchema = z.object({
  url: z.string().url("Must be a valid URL"),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    logger.warn({ authError }, "Unauthenticated scan attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { url: string };
  try {
    const raw = await req.json();
    body = bodySchema.parse(raw);
  } catch (err) {
    logger.warn({ err }, "Invalid request body");
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { url } = body;
  logger.info({ userId: user.id, url }, "Scan start");

  const { data: userRow, error: userErr } = await supabase
    .from("users")
    .select("plan_id, plans(max_scans_per_day)")
    .eq("id", user.id)
    .single();

  if (userErr || !userRow) {
    logger.error({ userErr }, "Failed to fetch user plan");
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }

  const maxScans =
    (userRow.plans as { max_scans_per_day: number } | null)?.max_scans_per_day ?? 1;

  const today = new Date().toISOString().slice(0, 10);

  const { data: usageRow } = await supabase
    .from("daily_usage")
    .select("id, scans_used")
    .eq("user_id", user.id)
    .eq("usage_date", today)
    .maybeSingle();

  const scansUsed = usageRow?.scans_used ?? 0;

  if (maxScans > 0 && scansUsed >= maxScans) {
    logger.warn({ userId: user.id, scansUsed, maxScans }, "Daily scan limit exceeded");
    return NextResponse.json(
      {
        error: "Daily scan limit reached",
        scans_used: scansUsed,
        max_scans: maxScans,
      },
      { status: 429 },
    );
  }

  if (usageRow) {
    const { error: updateErr } = await supabase
      .from("daily_usage")
      .update({ scans_used: scansUsed + 1 })
      .eq("id", usageRow.id);

    if (updateErr) {
      logger.error({ updateErr }, "Failed to increment scans_used");
      return NextResponse.json({ error: "Failed to update usage" }, { status: 500 });
    }
  } else {
    const { error: insertErr } = await supabase.from("daily_usage").insert({
      user_id: user.id,
      usage_date: today,
      scans_used: 1,
      ads_used: 0,
      keywords_used: 0,
    });

    if (insertErr) {
      logger.error({ insertErr }, "Failed to insert daily_usage row");
      return NextResponse.json({ error: "Failed to update usage" }, { status: 500 });
    }
  }

  let seoResult;
  try {
    const prompt = buildSeoPrompt(url);
    seoResult = await callGeminiForSeo(prompt);
  } catch (err) {
    logger.error({ err, url }, "Gemini call failed");
    return NextResponse.json({ error: "SEO analysis failed" }, { status: 502 });
  }

  const { data: scanRow, error: scanErr } = await supabase
    .from("url_scans")
    .insert({
      user_id: user.id,
      url,
      current_score: seoResult.current_score[0],
      projected_score: seoResult.projected_score[0],
      seo_result: seoResult,
    })
    .select("id")
    .single();

  if (scanErr || !scanRow) {
    logger.error({ scanErr }, "Failed to save scan to DB");
    return NextResponse.json({ error: "Failed to save scan result" }, { status: 500 });
  }

  logger.info({ userId: user.id, scanId: scanRow.id, url }, "Scan saved");

  return NextResponse.json({
    scan_id: scanRow.id,
    url,
    result: seoResult,
    scans_used: scansUsed + 1,
    max_scans: maxScans,
  });
}
