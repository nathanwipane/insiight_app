"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { ChevronsUpDown, Check, Building2 } from "lucide-react";
import { User } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";

interface Organisation {
  parent_org_id: string;
  organisation_name: string;
  logo?: string;
}

interface OrgSwitcherProps {
  collapsed: boolean;
}

export default function OrgSwitcher({ collapsed }: OrgSwitcherProps) {
  const params = useParams();
  const router = useRouter();
  const { data: session, update } = useSession();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ left: number; top: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const user = session?.user as User | undefined;
  const isSuperAdmin = user?.role_id === 1;
  const currentOrgId = params.parent_org_id as string;
  const token = user?.jwt ?? "";

  // Only fetch orgs if superadmin
  const { data: orgs } = useSWR<Organisation[]>(
    isSuperAdmin && token ? ["/get-all-organisations", token] : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function toggleOpen() {
    if (open) {
      setOpen(false);
      return;
    }
    // Anchor dropdown to the sidebar logo icon so it left-aligns with the brand,
    // not the chevron button. Fall back to the trigger if the logo isn't reachable.
    const logoEl = triggerRef.current
      ?.closest(".sidebar-header")
      ?.querySelector(".sidebar-logo-icon") as HTMLElement | null;
    const rect = (logoEl ?? triggerRef.current)?.getBoundingClientRect();
    if (rect) {
      setDropdownPos({ left: rect.left, top: rect.bottom + 6 });
    }
    setOpen(true);
  }

  async function switchOrg(orgId: string) {
    if (orgId === currentOrgId || switching) return;
    setSwitching(true);
    setOpen(false);
    try {
      // Get new JWT for the selected org
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/create-jwt-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ parent_org_id: orgId }),
        }
      );
      const data = await res.json();
      if (data?.token) {
        await update({ jwt: data.token });
        router.push(`/${orgId}/dashboard`);
      }
    } catch (err) {
      console.error("Org switch failed:", err);
    } finally {
      setSwitching(false);
    }
  }

  if (!isSuperAdmin || collapsed) return null;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        ref={triggerRef}
        onClick={toggleOpen}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 28, height: 28,
          background: "transparent", border: "none",
          borderRadius: 6, cursor: "pointer",
          color: "var(--brand-text-muted)",
          flexShrink: 0,
          transition: "color 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--brand-text)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--brand-text-muted)")}
        title="Switch organisation"
      >
        <ChevronsUpDown size={13} />
      </button>

      {open && dropdownPos && (
        <div
          style={{
            position: "fixed",
            left: dropdownPos.left,
            top: dropdownPos.top,
            minWidth: 200,
            background: "var(--brand-surface)",
            border: "1px solid var(--brand-border)",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
            zIndex: 9999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--brand-text-muted)",
              borderBottom: "1px solid var(--brand-border)",
            }}
          >
            Switch Organisation
          </div>

          <div style={{ padding: 4 }}>
            {!orgs ? (
              <div style={{ padding: "7px 8px", fontSize: 12, color: "var(--brand-text-muted)" }}>
                Loading...
              </div>
            ) : orgs.map(org => {
              const isActive = org.parent_org_id === currentOrgId;
              return (
                <div
                  key={org.parent_org_id}
                  onClick={() => switchOrg(org.parent_org_id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 8px",
                    fontSize: 12,
                    fontWeight: 500,
                    color: isActive ? "var(--brand-text)" : "var(--brand-text-secondary)",
                    cursor: isActive ? "default" : "pointer",
                    background: isActive ? "var(--brand-primary-subtle)" : "transparent",
                    borderRadius: 6,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--brand-border-subtle)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isActive ? "var(--brand-primary-subtle)" : "transparent"; }}
                >
                  <div
                    style={{
                      width: 22, height: 22,
                      borderRadius: 5,
                      background: "var(--brand-surface-alt)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Building2 size={12} style={{ color: "var(--brand-text-muted)" }} />
                  </div>
                  <span
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {org.organisation_name}
                  </span>
                  {isActive && <Check size={11} style={{ color: "var(--brand-text)", flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
