// ––––––––––– components/layout/sidebar.tsx –––––––––––––––––––––
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Home, LogOut, PanelLeft } from "lucide-react";
import { User } from "@/constants/types";
import { usePermissionsBasedNavigation } from "@/hooks/usePermissionsBasedNavigation";
import OrgSwitcher from "@/components/layout/OrgSwitcher";

interface SidebarProps {
  parentOrgId: string;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ parentOrgId, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as User | undefined;
  const orgType = user?.org_type ?? "";

  const {
    campaignItems,
    hasPermissionsLoaded,
  } = usePermissionsBasedNavigation(parentOrgId, orgType);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() || "U"
    : "U";

  return (
    <div
      className="flex flex-col shrink-0 border-r overflow-hidden"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        zIndex: 40,
        width: collapsed ? 52 : 224,
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
        transition: "width 0.3s ease",
      }}
    >
      {/* ── Header: Logo + Brand + OrgSwitcher + Toggle ──────── */}
      <div
        className="sidebar-header"
        style={{
          height: 44,
          display: "flex",
          alignItems: "center",
          gap: 8,
          justifyContent: collapsed ? "center" : undefined,
          padding: collapsed ? "0" : "0 16px",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <>
            <div
              className="sidebar-logo-icon"
              style={{
                width: 22, height: 22, background: "var(--color-text)",
                borderRadius: 5, display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 9, fontWeight: 800, color: "var(--color-surface)", letterSpacing: "-0.02em" }}>IN</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
              Insiight
            </span>
            <OrgSwitcher collapsed={collapsed} />
          </>
        )}
        <button
          className={!collapsed ? "ml-auto" : undefined}
          onClick={onToggle}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--color-text)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-muted)")}
          style={{
            width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "transparent",
            border: "none",
            borderRadius: 6, cursor: "pointer",
            color: "var(--color-text-muted)",
            flexShrink: 0,
          }}
        >
          <PanelLeft size={14} />
        </button>
      </div>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">

        {/* Nav groups — mt-2 wrapper keeps spacing consistent collapsed/expanded */}
        <div className="mt-2">
          {!hasPermissionsLoaded ? (
            <div className="flex flex-col gap-2 px-3 py-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="h-8 rounded"
                  style={{ background: "var(--color-border-subtle)", animation: "pulse 1.5s ease-in-out infinite" }}
                />
              ))}
            </div>
          ) : (
            <>
              <NavSection title="Navigation" collapsed={collapsed}>
                <NavItem href={`/${parentOrgId}/dashboard`} icon={<Home size={14} />} active={pathname === `/${parentOrgId}/dashboard`} collapsed={collapsed}>Dashboard</NavItem>
                {campaignItems.map(item => (
                  <NavItem key={item.href} href={item.href} icon={<item.icon size={14} />} active={isActive(item.href)} collapsed={collapsed}>{item.title}</NavItem>
                ))}
              </NavSection>
            </>
          )}
        </div>

      </div>

      {/* ── User block ───────────────────────────────────────── */}
      <div
        className="mt-auto border-t py-3"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center">

          {/* Avatar — fixed width matching icon column */}
          <span style={{ width: 52 }} className="flex items-center justify-center shrink-0">
            <div
              title={collapsed ? `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() || user?.email : undefined}
              className="w-7 h-7 rounded-full bg-[#f3f4f6] flex items-center justify-center text-[10px] font-semibold text-gray-600"
            >
              {initials}
            </div>
          </span>

          {/* Name + email + sign out — hidden when collapsed */}
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-800 truncate leading-tight">
                  {user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user?.email ?? "User"}
                </div>
                <div className="text-[10px] text-gray-400 truncate leading-tight mt-0.5">
                  {user?.email ?? ""}
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/signin" })}
                title="Sign out"
                className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded shrink-0 mr-2"
              >
                <LogOut size={12} />
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function NavSection({
  title,
  children,
  collapsed,
}: {
  title: string;
  children: React.ReactNode;
  collapsed: boolean;
}) {
  return (
    <div className="mb-2">
      {children}
    </div>
  );
}

function NavItem({
  children,
  href,
  active,
  icon,
  collapsed,
}: {
  children: React.ReactNode;
  href: string;
  active?: boolean;
  icon?: React.ReactNode;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? String(children) : undefined}
      style={active ? { background: "var(--color-surface-alt)" } : undefined}
      className={`flex items-center transition-colors no-underline w-full h-9 ${
        active
          ? "text-gray-900 font-medium"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {/* Icon sits in a fixed-width container matching collapsed sidebar width */}
      {icon && (
        <span
          className={`shrink-0 flex items-center justify-center ${active ? "text-gray-900" : "text-gray-400"}`}
          style={{ width: 52 }}
        >
          {icon}
        </span>
      )}
      {!collapsed && <span className="text-xs whitespace-nowrap pr-3">{children}</span>}
    </Link>
  );
}
