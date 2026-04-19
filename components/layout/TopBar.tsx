"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface TopBarProps {
  parentOrgId: string;
}

function useBreadcrumbs(pathname: string, parentOrgId: string) {
  const base = `/${parentOrgId}`;
  const relative = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const segments = relative.split("/").filter(Boolean);

  const labelMap: Record<string, string> = {
    dashboard:         "Dashboard",
    campaigns:         "Campaigns",
    drafts:            "Drafts",
    plans:             "Plans",
    "audience-finder": "Audience Finder",
    assets:            "Assets",
    settings:          "Settings",
  };

  return segments.map((seg, i) => ({
    label:  labelMap[seg] ?? seg.replace(/-/g, " "),
    href:   `/${parentOrgId}/${segments.slice(0, i + 1).join("/")}`,
    isLast: i === segments.length - 1,
  }));
}

export default function TopBar({ parentOrgId }: TopBarProps) {
  const pathname    = usePathname();
  const breadcrumbs = useBreadcrumbs(pathname, parentOrgId);

  return (
    <div
      className="h-11 flex items-center shrink-0 border-b"
      style={{
        background:  "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-center gap-2 px-4 w-full">

        <div className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0">
          {breadcrumbs.map((crumb, i) => (
            <div key={i} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && <ChevronRight size={10} className="text-gray-300 shrink-0" />}
              {crumb.isLast ? (
                <span className="text-gray-700 font-medium truncate">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-gray-700 transition-colors truncate no-underline text-gray-400"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
