import { createBrowserClient } from "@supabase/ssr";
import { clientEnv as env } from "@/lib/env";

/**
 * Returns a Supabase client for use in Client Components and browser hooks.
 * Creates a new instance each call — safe to call at module level in client components.
 */
export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions: {
        // 8-hour session lifetime
        maxAge: 60 * 60 * 8,
      },
    },
  );
}
