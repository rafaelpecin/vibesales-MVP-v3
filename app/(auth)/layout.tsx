import "../globals.css";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Vibe Sales — Sign in",
  description: "AI-powered SEO audits and ad copy generation.",
  icons: { icon: "/logo-white.svg" },
};

function AuthNav() {
  return (
    <nav style={{
      background: "linear-gradient(135deg, #021039 0%, #1B4F8A 100%)",
      padding: "0 32px",
      height: 56,
      display: "flex",
      alignItems: "center",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <Image src="/logo-white.svg" alt="Vibe Sales" width={36} height={34} priority />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 18, color: "#fff", letterSpacing: "-0.01em" }}>
          Vibe Sales
        </span>
      </Link>
    </nav>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh" }}>
        <AuthNav />
        {children}
      </body>
    </html>
  );
}
