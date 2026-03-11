import Stripe from "stripe";
import { env } from "@/lib/env";

/**
 * Singleton Stripe server-side client.
 * Use this in API route handlers and server actions only — never in client components.
 */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  typescript: true,
});
