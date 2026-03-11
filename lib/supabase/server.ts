import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Returns a Supabase client for use in Server Components, Server Actions, and API Route Handlers.
 * Must be called inside a request context where `cookies()` is available.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — cookies cannot be mutated.
            // The middleware handles session refresh, so this is safe to ignore.
          }
        },
      },
    },
  );
}

/**
 * Ensures a row exists in public.users for the given auth user.
 * Uses the admin client to bypass RLS. Safe to call on every authenticated request —
 * ignoreDuplicates means it's a no-op if the row already exists.
 */
export async function ensureUserProfile(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const admin = await createAdminClient();
  await admin.from("users").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: (user.user_metadata?.full_name ?? user.user_metadata?.name ?? null) as string | null,
    },
    { onConflict: "id", ignoreDuplicates: true },
  );
}

/**
 * Returns a Supabase admin client using the service role key.
 * Bypasses Row Level Security — use only in trusted server-side contexts.
 */
export async function createAdminClient() {
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  return createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
