import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { getPlanIdByPriceId } from "@/lib/stripe/plans";
import { createAdminClient } from "@/lib/supabase/server";
import { createLogger } from "@/lib/logger";
import { env } from "@/lib/env";

export const runtime = "nodejs";

const logger = createLogger("api/stripe/webhook");

/**
 * Stripe sends the raw body as a Buffer — Next.js must not parse it.
 * Reading the raw body via req.text() preserves the exact bytes needed for
 * signature verification.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    logger.warn("Webhook received without stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error({ err }, "Webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  logger.info({ eventType: event.type, eventId: event.id }, "Stripe webhook event received");

  const adminSupabase = await createAdminClient();

  try {
    switch (event.type) {
      // ── Subscription purchased ──────────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode !== "subscription") break;

        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (!userId || !planId) {
          logger.error({ sessionId: session.id }, "Missing metadata on checkout.session.completed");
          break;
        }

        // Resolve plan row id from the plans table
        const { data: planRow, error: planErr } = await adminSupabase
          .from("plans")
          .select("id")
          .ilike("name", planId)
          .single();

        if (planErr || !planRow) {
          logger.error({ planErr, planId }, "Plan not found in database for checkout.session.completed");
          break;
        }

        const { error: updateErr } = await adminSupabase
          .from("users")
          .update({
            plan_id: planRow.id,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: "active",
          })
          .eq("id", userId);

        if (updateErr) {
          logger.error({ updateErr, userId }, "Failed to update user after checkout.session.completed");
        } else {
          logger.info({ userId, planId }, "User plan activated after checkout.session.completed");
        }
        break;
      }

      // ── Subscription changed (upgrade / downgrade / renewal) ────────────
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          logger.warn({ subscriptionId: subscription.id }, "No userId in subscription metadata");
          break;
        }

        // Determine the new plan from the price ID on the first item
        const priceId = subscription.items.data[0]?.price?.id;
        const planId = priceId ? getPlanIdByPriceId(priceId) : undefined;

        const updatePayload: Record<string, unknown> = {
          subscription_status: subscription.status,
        };

        if (planId) {
          const { data: planRow } = await adminSupabase
            .from("plans")
            .select("id")
            .ilike("name", planId)
            .single();

          if (planRow) {
            updatePayload.plan_id = planRow.id;
          }
        }

        const { error: updateErr } = await adminSupabase
          .from("users")
          .update(updatePayload)
          .eq("id", userId);

        if (updateErr) {
          logger.error({ updateErr, userId }, "Failed to update user on subscription.updated");
        } else {
          logger.info({ userId, status: subscription.status, planId }, "User subscription updated");
        }
        break;
      }

      // ── Subscription cancelled ──────────────────────────────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          logger.warn({ subscriptionId: subscription.id }, "No userId in deleted subscription metadata");
          break;
        }

        // Revert user to free plan
        const { data: freePlan, error: freePlanErr } = await adminSupabase
          .from("plans")
          .select("id")
          .ilike("name", "free")
          .single();

        if (freePlanErr || !freePlan) {
          logger.error({ freePlanErr }, "Free plan not found; cannot revert user");
          break;
        }

        const { error: updateErr } = await adminSupabase
          .from("users")
          .update({
            plan_id: freePlan.id,
            stripe_subscription_id: null,
            subscription_status: "canceled",
          })
          .eq("id", userId);

        if (updateErr) {
          logger.error({ updateErr, userId }, "Failed to revert user to free on subscription.deleted");
        } else {
          logger.info({ userId }, "User reverted to free plan on subscription.deleted");
        }
        break;
      }

      default:
        logger.info({ eventType: event.type }, "Unhandled Stripe event type — skipping");
    }
  } catch (err) {
    logger.error({ err, eventType: event.type }, "Unexpected error processing Stripe webhook");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
