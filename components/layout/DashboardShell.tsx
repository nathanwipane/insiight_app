// ––––––––––––– components/layout/DashboardShell.tsx ––––––––––––
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

export default function DashboardShell({
  children,
  parentOrgId,
}: {
  children: React.ReactNode;
  parentOrgId: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { data: session, status } = useSession();

  useTokenRefresh();

  if (status === "loading") {
    return (
      <div style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        background: "var(--color-bg)",
      }} />
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-surface)" }}>
      <Sidebar
        parentOrgId={parentOrgId}
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
      />
      <div
        className="flex flex-col flex-1 min-w-0"
        style={{
          marginLeft: collapsed ? 52 : 224,
          transition: "margin-left 0.3s ease",
        }}
      >
        <TopBar
          parentOrgId={parentOrgId}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
