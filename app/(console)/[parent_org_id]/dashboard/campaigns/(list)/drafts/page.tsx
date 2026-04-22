// –– app/(console)/[parent_org_id]/dashboard/campaigns/(list)/drafts/page.tsx –––––––––––––––––––––––––––
"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Search } from "lucide-react";
import { CampaignTypeV2, User } from "@/constants/types";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/constants/config";
import { fetcher } from "@/lib/swrFetchers";
import { computeCampaignStatus } from "@/lib/campaigns";
import CampaignsTable from "@/components/campaigns/CampaignsTable";
import CampaignsTableSkeleton from "@/components/campaigns/CampaignsTableSkeleton";
import ErrorBanner from "@/components/ui/ErrorBanner";
import EmptyState from "@/components/ui/EmptyState";

export default function DraftCampaignsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const { hasPermission, hasPermissionsLoaded } = usePermissions();

  const parentOrgId = params.parent_org_id as string;
  const jwtToken    = (session?.user as User)?.jwt || "";

  const [search, setSearch] = useState("");

  // ── Data fetching ─────────────────────────────────────────────
  const shouldFetch = jwtToken && hasPermissionsLoaded && hasPermission(PERMISSIONS.CAMPAIGNS_VIEW);

  const { data: campaignData, error, isLoading } = useSWR<{ campaigns: CampaignTypeV2[] }>(
    shouldFetch ? ["/v2/get-all-campaigns", jwtToken] : null,
    fetcher,
    {
      refreshInterval:       3600000,
      revalidateOnFocus:     true,
      revalidateOnReconnect: true,
      errorRetryCount:       3,
    }
  );

  // ── Filter to drafts only ─────────────────────────────────────
  const draftCampaigns = useMemo(() => {
    if (!campaignData?.campaigns || !Array.isArray(campaignData.campaigns)) return [];
    return campaignData.campaigns.filter(c => computeCampaignStatus(c) === "draft");
  }, [campaignData?.campaigns]);

  // ── Search filter ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return draftCampaigns;
    const q = search.toLowerCase();
    return draftCampaigns.filter(c =>
      c.campaign_name?.toLowerCase().includes(q) ||
      c.campaign_alias?.toLowerCase().includes(q)
    );
  }, [draftCampaigns, search]);

  // ── Error state ───────────────────────────────────────────────
  if (error) {
    return <ErrorBanner message={`Error loading campaigns — ${error.message}`} />;
  }

  // ── Loading state ─────────────────────────────────────────────
  if (isLoading || !hasPermissionsLoaded) {
    return <CampaignsTableSkeleton />;
  }

  // ── Empty state ───────────────────────────────────────────────
  if (draftCampaigns.length === 0) {
    return (
      <EmptyState
        title="No draft campaigns"
        subtitle="Draft campaigns will appear here once created."
      />
    );
  }

  // ── Main render ───────────────────────────────────────────────
  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 10,
    }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "12px 16px", borderBottom: "1px solid var(--color-border)",
      }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)" }}>
          Draft campaigns
        </div>
        <div style={{ width: 1, height: 16, background: "var(--color-border)" }} />

        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search size={12} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-secondary)", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by campaign or client"
            style={{
              height: 30, paddingLeft: 28, paddingRight: 10,
              fontSize: 12, border: "1px solid var(--color-border)",
              borderRadius: 6, background: "var(--color-surface-alt)",
              color: "var(--color-text)", outline: "none", width: 260,
            }}
          />
        </div>

        <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--color-text-secondary)" }}>
          {filtered.length} of {draftCampaigns.length}
        </div>
      </div>

      {/* Table */}
      <CampaignsTable
        allCampaigns={filtered}
        disableDimming
        isDraftsTable
      />
    </div>
  );
}
