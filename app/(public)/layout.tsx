import "../globals.css";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Vibe Sales — AI SEO & Ad Generator",
  description: "Rank higher and sell more with instant AI-powered SEO audits and ad copy for Google, Meta, and Bing.",
  icons: { icon: "/logo-white.svg" },
};

function LandingNav() {
  return (
    <nav style={{
      background: "linear-gradient(135deg, #021039 0%, #1B4F8A 100%)",
      padding: "0 32px",
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <Image src="/logo-white.svg" alt="Vibe Sales" width={36} height={34} priority />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 18, color: "#fff", letterSpacing: "-0.01em" }}>
          Vibe Sales
        </span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/pricing" style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>
          Pricing
        </Link>
        <Link href="/login" style={{
          fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none",
          background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 16px",
          border: "1px solid rgba(255,255,255,0.2)",
        }}>
          Sign in
        </Link>
      </div>
    </nav>
  );
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#F7F8F6", minHeight: "100vh" }}>
        <LandingNav />
        {children}
      </body>
    </html>
  );
}
