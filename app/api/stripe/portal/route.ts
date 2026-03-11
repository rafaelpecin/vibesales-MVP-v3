import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import { createLogger } from "@/lib/logger";
import { env } from "@/lib/env";

const logger = createLogger("api/stripe/portal");

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    logger.warn({ authError }, "Unauthenticated portal attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Fetch stripe customer ID ──────────────────────────────────────────────
  const { data: userRow, error: userErr } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (userErr || !userRow?.stripe_customer_id) {
    logger.warn({ userId: user.id }, "No Stripe customer ID found for portal request");
    return NextResponse.json(
      { error: "No active subscription found. Please subscribe to a plan first." },
      { status: 400 },
    );
  }

  // ── Create customer portal session ───────────────────────────────────────
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userRow.stripe_customer_id,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    logger.info(
      { userId: user.id, customerId: userRow.stripe_customer_id },
      "Stripe customer portal session created",
    );

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    logger.error({ err, userId: user.id }, "Failed to create Stripe customer portal session");
    return NextResponse.json({ error: "Failed to open billing portal" }, { status: 500 });
  }
}
