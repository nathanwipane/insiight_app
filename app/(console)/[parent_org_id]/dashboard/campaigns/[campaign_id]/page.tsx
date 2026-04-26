// –– app/[parent_org_id]/dashboard/campaigns/[campaign_id]/page.tsx –––––––––––––––––––––––––––
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { User, CampaignDetailV2 } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/constants/config";

import CampaignDetailHeader, { DetailTab } from "@/components/campaigns/detail/CampaignDetailHeader";
import CampaignMetricsRow from "@/components/campaigns/detail/CampaignMetricsRow";
import CampaignTimeseriesCard from "@/components/campaigns/detail/CampaignTimeseriesCard";
import CampaignGalleryQuickview from "@/components/campaigns/detail/CampaignGalleryQuickview";
import CampaignInnerTabs, { InnerTab } from "@/components/campaigns/detail/CampaignInnerTabs";

import CampaignPerformanceTab from "@/components/campaigns/detail/tabs/CampaignPerformanceTab";
import AudienceInsightsTab    from "@/components/campaigns/detail/tabs/AudienceInsightsTab";
import CreativeBreakdownTab   from "@/components/campaigns/detail/tabs/CreativeBreakdownTab";
import InsightsAITab          from "@/components/campaigns/detail/tabs/InsightsAITab";
import ProofOfPlayTab         from "@/components/campaigns/detail/tabs/ProofOfPlayTab";
import ReportsTab             from "@/components/campaigns/detail/tabs/ReportsTab";

// ── Page ─────────────────────────────────────────────────────────
export default function CampaignDetailPage() {
  const params     = useParams();
  const campaignId = params.campaign_id as string;
  const { data: session } = useSession();
  const token      = (session?.user as User)?.jwt ?? "";
  const { hasPermission, hasPermissionsLoaded } = usePermissions();

  const [activeTab,  setActiveTab]  = useState<DetailTab>("dashboard");
  const [innerTab,   setInnerTab]   = useState<InnerTab>("performance");

  const shouldFetch = !!token && !!campaignId && hasPermissionsLoaded;

  // ── Core fetches (always needed) ──────────────────────────────
  const { data: campaignDetail, isLoading: detailLoading } = useSWR<CampaignDetailV2>(
    shouldFetch && hasPermission(PERMISSIONS.CAMPAIGNS_VIEW)
      ? [`/v2/campaign/${campaignId}`, token]
      : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, errorRetryCount: 3 }
  );

  const { data: aiInsights, isLoading: aiLoading } = useSWR(
    shouldFetch && hasPermission(PERMISSIONS.CAMPAIGNS_VIEW)
      ? [`/v2/campaign/${campaignId}/insights`, token]
      : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, errorRetryCount: 3 }
  );

  const campaign    = campaignDetail ?? null;
  const metrics     = campaignDetail ?? null;
  const ai          = aiInsights?.pcr ?? null;
  const coreLoading = detailLoading || aiLoading;


  // ── Report count for tab badge (from notifications in old project)
  // Simplified: just show 1 if PCR exists, handled inside ReportsTab
  const reportCount = 0;

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <CampaignDetailHeader
        campaign={campaign ?? null}
        isLoading={coreLoading}
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab);
          if (tab === "dashboard") setInnerTab("performance");
        }}
        reportCount={reportCount}
      />

      {/* ── Content ── */}
      <div style={{ flex: 1, padding: "24px 32px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === "dashboard" && (
          <>
            <CampaignMetricsRow metrics={metrics} isLoading={coreLoading} aiOverview={ai} />

            <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16, alignItems: "stretch" }}>
              <CampaignTimeseriesCard />
              <CampaignGalleryQuickview onViewAll={() => setActiveTab("pops")} />
            </div>

            {/* Inner tab selector */}
            <CampaignInnerTabs activeTab={innerTab} onTabChange={setInnerTab} />

            {/* Inner tab content */}
            {innerTab === "performance" && <CampaignPerformanceTab />}
            {innerTab === "audience"    && (
              <AudienceInsightsTab
                impressions={campaign?.total_impressions ?? 0}
                campaign={campaign}
              />
            )}
            {innerTab === "creative"    && <CreativeBreakdownTab />}
            {innerTab === "ai"          && <InsightsAITab aiOverview={ai} />}
          </>
        )}

        {/* ── PROOF OF PLAY TAB ── */}
        {activeTab === "pops" && <ProofOfPlayTab />}

        {/* ── REPORTS TAB ── */}
        {activeTab === "reports" && <ReportsTab campaign={campaign} />}
      </div>
    </div>
  );
}
