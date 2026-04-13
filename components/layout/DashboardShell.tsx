// ––––––––––––– components/layout/DashboardShell.tsx ––––––––––––
"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default function DashboardShell({
  children,
  parentOrgId,
}: {
  children: React.ReactNode;
  parentOrgId: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-surface)" }}>
      <Sidebar
        parentOrgId={parentOrgId}
        collapsed={collapsed}
      />
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out"
      >
        <TopBar
          parentOrgId={parentOrgId}
          onToggleSidebar={() => setCollapsed(v => !v)}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}