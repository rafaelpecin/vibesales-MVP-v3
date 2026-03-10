import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createLogger } from "@/lib/logger";

const logger = createLogger("middleware");

const PROTECTED_PREFIXES = ["/dashboard", "/scans", "/ads", "/settings", "/admin"];
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

/**
 * Next.js Edge Middleware — runs before every matched request.
 * Responsibilities:
 *  1. Refresh the Supabase session cookie.
 *  2. Redirect unauthenticated users away from protected routes.
 *  3. Redirect authenticated users away from auth pages.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const { response, user } = await updateSession(request);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isProtected && !user) {
    logger.info({ pathname }, "Unauthenticated access to protected route — redirecting to login");
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Preserve intended destination so we can redirect back after login.
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && user) {
    logger.debug({ pathname, userId: user.id }, "Authenticated user on auth route — redirecting to dashboard");
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  // Admin-only guard
  if (pathname.startsWith("/admin") && user) {
    // Role check is done inside admin layout via server component — middleware
    // only ensures the session exists to avoid an extra round-trip here.
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and Next.js internals.
     * This pattern is the official Supabase SSR recommendation.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
