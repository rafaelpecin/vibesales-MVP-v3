import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe/client";
import { getStripePlanById } from "@/lib/stripe/plans";
import { createClient } from "@/lib/supabase/server";
import { createLogger } from "@/lib/logger";
import { env } from "@/lib/env";

const logger = createLogger("api/stripe/checkout");

const bodySchema = z.object({
  planId: z.string().min(1, "planId is required"),
});

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    logger.warn({ authError }, "Unauthenticated checkout attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: { planId: string };
  try {
    const raw = await req.json();
    body = bodySchema.parse(raw);
  } catch (err) {
    logger.warn({ err }, "Invalid checkout request body");
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { planId } = body;

  // ── Validate plan ─────────────────────────────────────────────────────────
  const planConfig = getStripePlanById(planId);
  if (!planConfig) {
    logger.warn({ planId }, "Unknown planId in checkout request");
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  if (!planConfig.priceId) {
    logger.error({ planId }, "Stripe price ID not configured for plan");
    return NextResponse.json({ error: "Plan not available" }, { status: 503 });
  }

  // ── Fetch existing stripe customer ID if any ──────────────────────────────
  const { data: userRow, error: userErr } = await supabase
    .from("users")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .single();

  if (userErr) {
    logger.error({ userErr, userId: user.id }, "Failed to fetch user row for checkout");
    return NextResponse.json({ error: "Failed to load user data" }, { status: 500 });
  }

  // ── Build Stripe Checkout session ─────────────────────────────────────────
  const appUrl = env.NEXT_PUBLIC_APP_URL;

  try {
    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: "subscription",
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?checkout=success&plan=${planId}`,
      cancel_url: `${appUrl}/pricing?checkout=cancelled`,
      customer_email: userRow?.stripe_customer_id ? undefined : (user.email ?? undefined),
      customer: userRow?.stripe_customer_id ?? undefined,
      metadata: {
        userId: user.id,
        planId,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId,
        },
      },
      allow_promotion_codes: true,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    logger.info(
      { userId: user.id, planId, sessionId: session.id },
      "Stripe checkout session created",
    );

    return NextResponse.json({ url: session.url });
  } catch (err) {
    logger.error({ err, userId: user.id, planId }, "Failed to create Stripe checkout session");
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
