"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { User, CampaignInfoType, MetricsData, CampaignAIOverview } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";
import { useIsTestOrg } from "@/hooks/useIsTestOrg";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/constants/config";

import CampaignDetailHeader, { DetailTab } from "@/components/campaigns/detail/CampaignDetailHeader";
import CampaignAISummary from "@/components/campaigns/detail/CampaignAISummary";
import CampaignStatCards from "@/components/campaigns/detail/CampaignStatCards";
import CampaignInnerTabs, { InnerTab } from "@/components/campaigns/detail/CampaignInnerTabs";

import CampaignPerformanceTab from "@/components/campaigns/detail/tabs/CampaignPerformanceTab";
import AudienceInsightsTab    from "@/components/campaigns/detail/tabs/AudienceInsightsTab";
import CreativeBreakdownTab   from "@/components/campaigns/detail/tabs/CreativeBreakdownTab";
import InsightsAITab          from "@/components/campaigns/detail/tabs/InsightsAITab";
import ProofOfPlayTab         from "@/components/campaigns/detail/tabs/ProofOfPlayTab";
import ReportsTab             from "@/components/campaigns/detail/tabs/ReportsTab";

// ── Sample data ───────────────────────────────────────────────────
import { SAMPLE_CAMPAIGNS } from "@/lib/testData";

const SAMPLE_CAMPAIGN_INFO: CampaignInfoType = {
  id: 1,
  org_id: "org-001",
  campaign_id: "cmp-a1b2c3",
  campaign_name: "Summer Drive Awareness",
  client_name: "Tourism Australia",
  agency_name: "PHD Media",
  organisation_name: "Tourism Australia",
  status: "active",
  start_date: "2026-03-01",
  end_date: "2026-05-31",
  impressions_achieved: 3200000,
  impressions_target: 5000000,
  projected_impressions: 5200000,
  projected_reach: 1800000,
  display_creative: "",
  creative_list: [],
  asset_list: [],
  description: "National roadside billboard campaign targeting interstate travellers.",
  notes: null,
  goals: "Brand awareness and destination consideration",
  target_audiences: "Families, Road trippers",
  created_by: null,
  created_at: "2026-01-15T09:00:00Z",
  last_updated: "2026-04-08T10:30:00Z",
  last_updated_impression: "2026-04-08T10:30:00Z",
};

const SAMPLE_METRICS: MetricsData = {
  total_impressions: 3200000,
  total_unique_reach: 487961,
  average_daily_impressions: 168936,
  average_daily_reach: 25682,
  ad_plays: 58240,
  date: "2026-04-08",
};

const SAMPLE_AI_OVERVIEW: CampaignAIOverview = {
  exec_summary: "The Summer Drive Awareness campaign is delivering strong market impact, achieving 3.2M impressions to date against a 5M target with strong trajectory for full delivery.",
  audience_assessment: "The campaign has demonstrated high penetration among families and road trippers in key metro and regional areas, with above-average dwell times indicating strong creative engagement.",
};

// ── Page ─────────────────────────────────────────────────────────
export default function CampaignDetailPage() {
  const params     = useParams();
  const campaignId = params.campaign_id as string;
  const { data: session } = useSession();
  const token      = (session?.user as User)?.jwt ?? "";
  const isTestOrg  = useIsTestOrg();
  const { hasPermission, hasPermissionsLoaded } = usePermissions();

  const [activeTab,  setActiveTab]  = useState<DetailTab>("dashboard");
  const [innerTab,   setInnerTab]   = useState<InnerTab>("performance");

  const shouldFetch = !isTestOrg && !!token && !!campaignId && hasPermissionsLoaded;

  // ── Core fetches (always needed) ──────────────────────────────
  const { data: campaignInfo, isLoading: infoLoading } = useSWR<CampaignInfoType>(
    shouldFetch && hasPermission(PERMISSIONS.CAMPAIGNS_VIEW)
      ? [`/get-campaign-info/${campaignId}`, token]
      : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, errorRetryCount: 3 }
  );

  const { data: metricsData, isLoading: metricsLoading } = useSWR<MetricsData[]>(
    shouldFetch && hasPermission(PERMISSIONS.CAMPAIGNS_VIEW)
      ? [`/get-core-campaign-metrics/${campaignId}`, token]
      : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, errorRetryCount: 3 }
  );

  const { data: aiOverview, isLoading: aiLoading } = useSWR<CampaignAIOverview>(
    shouldFetch && hasPermission(PERMISSIONS.CAMPAIGNS_VIEW)
      ? [`/get-campaign-ai-overview/${campaignId}`, token]
      : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, errorRetryCount: 3 }
  );

  // ── Resolve data (test org vs real) ───────────────────────────
  const campaign   = isTestOrg ? SAMPLE_CAMPAIGN_INFO : campaignInfo;
  const metrics    = isTestOrg ? SAMPLE_METRICS       : (metricsData?.[0] ?? null);
  const ai         = isTestOrg ? SAMPLE_AI_OVERVIEW   : (aiOverview ?? null);
  const coreLoading = !isTestOrg && (infoLoading || metricsLoading || aiLoading);

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
            {/* AI Summary */}
            <CampaignAISummary data={ai} isLoading={coreLoading} />

            {/* Stat cards */}
            <CampaignStatCards metrics={metrics} isLoading={coreLoading} />

            {/* Inner tab selector */}
            <CampaignInnerTabs activeTab={innerTab} onTabChange={setInnerTab} />

            {/* Inner tab content */}
            {innerTab === "performance" && <CampaignPerformanceTab />}
            {innerTab === "audience"    && <AudienceInsightsTab />}
            {innerTab === "creative"    && <CreativeBreakdownTab />}
            {innerTab === "ai"          && <InsightsAITab aiOverview={ai} />}
          </>
        )}

        {/* ── PROOF OF PLAY TAB ── */}
        {activeTab === "pops" && <ProofOfPlayTab />}

        {/* ── REPORTS TAB ── */}
        {activeTab === "reports" && <ReportsTab />}
      </div>
    </div>
  );
}