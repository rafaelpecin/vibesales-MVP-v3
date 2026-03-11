import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { createLogger } from "@/lib/logger";
import { env } from "@/lib/env";

const logger = createLogger("api/auth/callback");

/**
 * OAuth callback handler.
 * Supabase redirects here after Google / Facebook OAuth flow completes.
 * Exchanges the one-time `code` for a session, then upserts the user
 * profile in `public.users` if this is their first login.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  logger.info({ next }, "OAuth callback received");

  if (!code) {
    logger.error("OAuth callback missing code parameter");
    return NextResponse.redirect(`${origin}/login?error=oauth_missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    logger.error({ error: error?.message }, "Failed to exchange OAuth code for session");
    return NextResponse.redirect(`${origin}/login?error=oauth_callback_failed`);
  }

  const { user } = data.session;
  logger.info({ userId: user.id, provider: user.app_metadata?.provider }, "OAuth session established");

  // Upsert the user profile so first-time logins get a row in public.users.
  // Use the admin client to bypass RLS — the user session may not be propagated yet.
  const adminClient = await createAdminClient();
  const { error: upsertError } = await adminClient.from("users").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    },
    {
      onConflict: "id",
      ignoreDuplicates: true,
    },
  );

  if (upsertError) {
    // Non-fatal — session is already active; log and continue.
    logger.error({ userId: user.id, error: upsertError.message }, "Failed to upsert user profile after OAuth");
  }

  const redirectUrl = next.startsWith("/") ? `${env.NEXT_PUBLIC_APP_URL}${next}` : env.NEXT_PUBLIC_APP_URL;
  return NextResponse.redirect(redirectUrl);
}
