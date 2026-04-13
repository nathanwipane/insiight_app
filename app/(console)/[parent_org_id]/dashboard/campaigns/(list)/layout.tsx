"use client";

import { usePathname, useParams, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/constants/config";
import { useSession } from "next-auth/react";
import { User } from "@/constants/types";
import useSWR from "swr";
import { fetcher } from "@/lib/swrFetchers";
import { useIsTestOrg } from "@/hooks/useIsTestOrg";
import { SAMPLE_CAMPAIGNS } from "@/lib/testData";
import { CampaignType } from "@/constants/types";
import { computeCampaignStatus } from "@/lib/campaigns";

export default function CampaignsLayout({ children }: { children: React.ReactNode }) {
  const params      = useParams();
  const pathname    = usePathname();
  const router      = useRouter();
  const { data: session } = useSession();
  const { hasPermission, hasPermissionsLoaded } = usePermissions();
  const isTestOrg   = useIsTestOrg();

  const parentOrgId = params.parent_org_id as string;
  const jwtToken    = (session?.user as User)?.jwt || "";

  // ── Data fetching (for draft count badge) ─────────────────────
  const shouldFetch = !isTestOrg && jwtToken && hasPermissionsLoaded && hasPermission(PERMISSIONS.CAMPAIGNS_VIEW);

  const { data: campaignData } = useSWR<{ campaigns: CampaignType[] }>(
    shouldFetch ? ["/get-all-campaigns", jwtToken] : null,
    fetcher,
    {
      refreshInterval:       3600000,
      revalidateOnFocus:     true,
      revalidateOnReconnect: true,
      errorRetryCount:       3,
      fallbackData: isTestOrg ? { campaigns: SAMPLE_CAMPAIGNS } : undefined,
    }
  );

  const draftCnt = (campaignData?.campaigns ?? []).filter(
    c => computeCampaignStatus(c) === "draft"
  ).length;

  // ── Tab config ────────────────────────────────────────────────
  const campaignsPath = `/${parentOrgId}/dashboard/campaigns`;
  const draftsPath    = `/${parentOrgId}/dashboard/campaigns/drafts`;

  const tabs = [
    { label: "Campaigns", href: campaignsPath, count: null },
    { label: "Drafts",    href: draftsPath,    count: draftCnt },
  ];

  const isTabActive = (href: string) => {
    if (href === campaignsPath) {
      return pathname === campaignsPath;
    }
    return pathname.startsWith(href);
  };

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      {/* ── White header ── */}
      <div style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", padding: "16px 32px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: "var(--color-text)", letterSpacing: "-0.02em", margin: "0 0 3px", fontFamily: "var(--font-sans)" }}>
              Manage Your Campaigns
            </h1>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0 }}>
              View and manage all your campaigns in one place
            </p>
          </div>
          {hasPermission(PERMISSIONS.CAMPAIGNS_CREATE) && (
            <button
              onClick={() => router.push(`${campaignsPath}?addCampaign=true`)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                height: 32, padding: "0 14px",
                background: "var(--color-text)", color: "var(--color-surface)",
                border: "none", borderRadius: 7,
                fontSize: 12, fontWeight: 500, cursor: "pointer",
              }}
            >
              <Plus size={12} /> Create campaign
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex" }}>
          {tabs.map(tab => {
            const active = isTabActive(tab.href);
            return (
              <div
                key={tab.label}
                onClick={() => router.push(tab.href)}
                style={{
                  padding: "8px 16px",
                  fontSize: 13, fontWeight: active ? 500 : 400,
                  color: active ? "var(--color-text)" : "var(--color-text-secondary)",
                  borderBottom: active ? "2px solid var(--color-text)" : "2px solid transparent",
                  cursor: "pointer", marginBottom: -1,
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {tab.label}
                {tab.count != null && tab.count > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    background: "var(--color-surface-alt)", color: "var(--color-text-secondary)",
                    borderRadius: 999, padding: "1px 6px",
                  }}>{tab.count}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "20px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
    </div>
  );
}
