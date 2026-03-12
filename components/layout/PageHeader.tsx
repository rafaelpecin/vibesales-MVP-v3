import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, backHref, backLabel, action }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {backHref && (
        <Link
          href={backHref}
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-[#64748B] hover:text-[#1A7A4A] transition-colors duration-150"
        >
          <ChevronLeft size={14} />
          {backLabel ?? "Back"}
        </Link>
      )}
      <div className="flex items-start justify-between gap-4">
        <div  style={{
      borderRadius: 10,
      padding: "16px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 20,
      background: "linear-gradient(135deg, #021039 0%, #1B4F8A 100%)",
      boxShadow: "0 2px 12px rgba(26,122,74,0.25)",
    }}>
          <h1
            className="text-2xl font-bold text-[#1A1F2E] leading-tight title"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm subtitle">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
