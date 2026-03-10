"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Help / FAQ", href: "/faq" },
];

/** Landing page footer with nav links and auth-aware login/dashboard link. */
export function LandingFooter() {
  const { user } = useAuth();

  return (
    <footer className="border-t border-gray-200 bg-white py-10 px-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-extrabold text-gray-900 dark:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          Vibe Sales
        </Link>

        {/* Nav links */}
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={user ? "/dashboard" : "/login"}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {user ? "Dashboard" : "Login"}
              </Link>
            </li>
          </ul>
        </nav>

        <p className="text-xs text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} Vibe Sales. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
