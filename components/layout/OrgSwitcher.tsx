"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { ChevronsUpDown, Check } from "lucide-react";
import { User } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";

interface Organisation {
  id: number;
  client_id: string;
  client_name: string;
  logo?: string;
  status?: string;
  db_name?: string;
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
    isSuperAdmin && token ? ["/v2/get-all-organisations", token] : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  function getInitials(name: string): string {
    return name
      .split(" ")
      .filter(Boolean)
      .map(w => w[0].toUpperCase())
      .slice(0, 2)
      .join("");
  }

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
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setDropdownPos({
        left: rect.right + 6,
        top: rect.top,
      });
    }
    setOpen(true);
  }

  async function switchOrg(orgId: string) {
    if (orgId === currentOrgId || switching) return;
    setSwitching(true);
    setOpen(false);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v2/create-jwt-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user?.email,
            parent_org_id: orgId,
            role_id: user?.role_id,
            org_id: user?.org_id ?? orgId,
            user_id: user?.id,
            org_name: orgs?.find(o => o.client_id === orgId)?.client_name ?? orgId,
            permissions: Array.isArray(user?.permissions) ? user.permissions : [],
          }),
        }
      );
      const data = await res.json();
      if (data?.status && data?.data?.access_token) {
        await update({ jwt: data.data.access_token });
        // Force a hard navigation instead of client-side push so the new
        // session cookie is picked up by the server before the layout runs
        window.location.href = `/${orgId}/dashboard`;
      } else {
        console.error("Org switch: unexpected response", data);
      }
    } catch (err) {
      console.error("Org switch failed:", err);
    } finally {
      setSwitching(false);
    }
  }

  if (!isSuperAdmin || collapsed) return null;

  const activeOrgs = (orgs ?? []).filter(o => o.status === 'active');
  const inactiveOrgs = (orgs ?? []).filter(o => o.status !== 'active');

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
            minWidth: 180,
            background: "var(--brand-surface)",
            border: "1px solid var(--brand-border)",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
            zIndex: 9999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "6px 10px",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--brand-text-muted)",
            }}
          >
            Switch Organisation
          </div>

          <div style={{ padding: 3 }}>
            {!orgs ? (
              <div style={{ padding: "5px 6px", fontSize: 11, color: "var(--brand-text-muted)" }}>
                Loading...
              </div>
            ) : activeOrgs.map(org => {
              const isActive = org.client_id === currentOrgId;
              return (
                <div
                  key={org.client_id}
                  onClick={() => switchOrg(org.client_id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "5px 6px",
                    fontSize: 11,
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
                  <div style={{
                    width: 22, height: 22,
                    borderRadius: 5,
                    background: "var(--brand-text)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontSize: 8,
                      fontWeight: 700,
                      color: "#ffffff",
                      letterSpacing: "0.02em",
                      lineHeight: 1,
                    }}>
                      {getInitials(org.client_name)}
                    </span>
                  </div>
                  <span
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {org.client_name}
                  </span>
                  {isActive && <Check size={11} style={{ color: "var(--brand-text)", flexShrink: 0 }} />}
                </div>
              );
            })}

            {inactiveOrgs.length > 0 && (
              <div style={{
                padding: "6px 8px",
                fontSize: 11,
                color: "var(--brand-text-disabled)",
                cursor: "default",
              }}>
                {inactiveOrgs.length} inactive organisation{inactiveOrgs.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
