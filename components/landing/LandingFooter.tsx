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
    <footer className="border-t border-gray-200 bg-white py-10 px-4  ">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-extrabold text-[#1A1F2E] ">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1A7A4A] to-[#1B4F8A]">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          Vibe Sales
        </Link>

        {/* Nav links */}
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap justify-center gap-6 text-sm text-[#64748B] ">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-[#1A7A4A] dark:hover:text-[#2ECC7A] transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={user ? "/dashboard" : "/login"}
                className="hover:text-[#1A7A4A] dark:hover:text-[#2ECC7A] transition-colors"
              >
                {user ? "Dashboard" : "Login"}
              </Link>
            </li>
          </ul>
        </nav>

        <p className="text-xs text-gray-400 dark:text-[#64748B]">
          © {new Date().getFullYear()} Vibe Sales. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
