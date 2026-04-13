"use client";

import { Clock, Download, Share2 } from "lucide-react";
import { CampaignInfoType } from "@/constants/types";
import CampaignStatusBadge from "@/components/campaigns/CampaignStatusBadge";
import { formatCampaignDate, computeCampaignProgress } from "@/lib/campaigns";

// ── Outer tabs ────────────────────────────────────────────────────
export type DetailTab = "dashboard" | "pops" | "reports";

const TABS: { key: DetailTab; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "pops",      label: "Proof Of Play" },
  { key: "reports",   label: "Reports" },
];

interface CampaignDetailHeaderProps {
  campaign: CampaignInfoType | null;
  isLoading?: boolean;
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  reportCount?: number; // badge on Reports tab
}

export default function CampaignDetailHeader({
  campaign,
  isLoading,
  activeTab,
  onTabChange,
  reportCount = 0,
}: CampaignDetailHeaderProps) {

  const progress = campaign ? computeCampaignProgress({
    impressions_achieved: campaign.impressions_achieved ?? 0,
    impressions_target:   campaign.impressions_target,
    projected_impressions: campaign.projected_impressions,
  }) : 0;

  return (
    <div style={{
      background: "var(--color-surface)",
      borderBottom: "1px solid var(--color-border)",
      flexShrink: 0,
    }}>
      {/* ── Title row ── */}
      <div style={{ padding: "16px 32px 12px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>

        {/* Left: name + status + progress + meta */}
        <div style={{ minWidth: 0 }}>
          {isLoading || !campaign ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ height: 18, width: 320, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ height: 11, width: 240, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite", opacity: 0.6 }} />
            </div>
          ) : (
            <>
              {/* Name + status + progress */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                <h1 style={{
                  fontSize: 18, fontWeight: 600,
                  color: "var(--color-text)",
                  letterSpacing: "-0.02em", margin: 0,
                }}>
                  {campaign.campaign_name}
                </h1>
                <CampaignStatusBadge status={campaign.status?.toLowerCase() ?? "draft"} />
                {/* Progress pill */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 80, height: 4, background: "var(--color-border)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${progress}%`,
                      background: "var(--color-text)",
                      borderRadius: 99,
                    }} />
                  </div>
                  <span suppressHydrationWarning style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)" }}>
                    {progress}%
                  </span>
                </div>
              </div>

              {/* Meta row */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                {campaign.agency_name && (
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)" }}>
                    {campaign.agency_name}
                  </span>
                )}
                {campaign.agency_name && (
                  <span style={{ color: "var(--color-border)", fontSize: 12 }}>·</span>
                )}
                <span suppressHydrationWarning style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-text-secondary)" }}>
                  <Clock size={10} />
                  {formatCampaignDate(campaign.start_date)} – {formatCampaignDate(campaign.end_date)}
                </span>
                {campaign.client_name && (
                  <>
                    <span style={{ color: "var(--color-border)", fontSize: 12 }}>·</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                      {campaign.client_name}
                    </span>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right: action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            height: 32, padding: "0 12px",
            fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 7, cursor: "pointer",
          }}>
            <Download size={11} /> Export
          </button>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            height: 32, padding: "0 12px",
            fontSize: 12, fontWeight: 500,
            color: "var(--color-surface)",
            background: "var(--color-text)",
            border: "none", borderRadius: 7, cursor: "pointer",
          }}>
            <Share2 size={11} /> Share Dashboard
          </button>
        </div>
      </div>

      {/* ── Outer tabs ── */}
      <div style={{ display: "flex", paddingLeft: 32, gap: 0 }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              style={{
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "var(--color-text)" : "var(--color-text-secondary)",
                background: "none",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                borderBottom: isActive ? "2px solid var(--color-text)" : "2px solid transparent",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                marginBottom: -1,
              }}
            >
              {tab.label}
              {tab.key === "reports" && reportCount > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  background: "var(--color-surface-alt)",
                  color: "var(--color-text-secondary)",
                  borderRadius: 999, padding: "1px 6px",
                }}>
                  {reportCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}