import "../globals.css";

export const metadata = {
  title: "Vibe Sales — Sign in",
  description: "AI-powered SEO audits and ad copy generation.",
};

export default function AuthLayout({
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
