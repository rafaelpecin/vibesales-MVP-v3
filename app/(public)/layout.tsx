import "../globals.css";

export const metadata = {
  title: "Vibe Sales — AI SEO & Ad Generator",
  description: "Rank higher and sell more with instant AI-powered SEO audits and ad copy for Google, Meta, and Bing.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#F7F8F6", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
