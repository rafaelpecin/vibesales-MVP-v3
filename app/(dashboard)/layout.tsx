import "../globals.css";
import { DashboardNav } from "@/components/layout/DashboardNav";

export const metadata = {
  title: "Vibe Sales — Dashboard",
  description: "AI-powered SEO audits and ad copy generation.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, display: "flex", minHeight: "100vh", background: "#F7F8F6" }}>
        <DashboardNav />
        <div style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
