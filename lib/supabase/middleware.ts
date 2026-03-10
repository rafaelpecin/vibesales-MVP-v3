import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

/**
 * Refreshes the Supabase session cookie on every request passing through middleware.
 * Returns the potentially-modified response and the authenticated user (or null).
 *
 * @param request - The incoming Next.js middleware request
 * @returns Object with the response (with refreshed cookies) and the current user
 */
export async function updateSession(request: NextRequest) {
  // Start with a passthrough response so we can attach Set-Cookie headers.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mirror cookies onto both the request and the response so downstream
          // Server Components see the refreshed session immediately.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() triggers a token refresh if the access token is expired.
  // Do NOT replace this with getSession() — it does not validate the JWT server-side.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response: supabaseResponse, user };
}
