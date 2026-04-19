"use client";

import { Wand2 } from "lucide-react";
import { MetricsData, CampaignAIOverview } from "@/constants/types";
import { formatImpressions } from "@/lib/campaigns";

interface CampaignMetricsRowProps {
  metrics: MetricsData | null;
  isLoading?: boolean;
  aiOverview?: CampaignAIOverview | null;
}

const METRICS_CONFIG = [
  { label: "Total impressions", sub: "All", key: "impressions", delta: "↑ +18.4% vs last period" },
  { label: "Unique reach",      sub: "All", key: "reach",       delta: "↑ +12.1% vs last period" },
  { label: "Frequency",         sub: "All", key: "frequency",   delta: "↑ +0.81× vs last period" },
  { label: "Avg daily",         sub: "All", key: "avgDaily",    delta: "↑ +6.2% vs last period"  },
  { label: "Total ad plays",    sub: "All", key: "adPlays",     delta: "Campaign to date"         },
] as const;

export default function CampaignMetricsRow({ metrics, isLoading, aiOverview }: CampaignMetricsRowProps) {
  const frequency = metrics && metrics.total_unique_reach > 0
    ? (metrics.total_impressions / metrics.total_unique_reach).toFixed(2)
    : "—";

  const values: Record<string, string> = metrics ? {
    impressions: formatImpressions(metrics.total_impressions),
    reach:       formatImpressions(metrics.total_unique_reach),
    frequency,
    avgDaily:    formatImpressions(metrics.average_daily_impressions),
    adPlays:     metrics.ad_plays ? formatImpressions(metrics.ad_plays) : "—",
  } : {};

  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 10, overflow: "hidden",
    }}>
      {/* Card header */}
      <div style={{
        padding: "12px 20px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface-alt)",
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text)" }}>
          Performance metrics
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
          Campaign to date
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", padding: "0 8px" }}>
        {isLoading || !metrics ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ padding: "16px" }}>
              <div style={{ height: 10, width: "60%", background: "var(--color-border)", borderRadius: 4, marginBottom: 6, animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ height: 10, width: "30%", background: "var(--color-border)", borderRadius: 4, marginBottom: 12, animation: "pulse 1.5s ease-in-out infinite", opacity: 0.5 }} />
              <div style={{ height: 28, width: "50%", background: "var(--color-border)", borderRadius: 4, marginBottom: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ height: 10, width: "70%", background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite", opacity: 0.5 }} />
            </div>
          ))
        ) : (
          METRICS_CONFIG.map(m => (
            <div key={m.key} style={{ padding: "16px" }}>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 2 }}>{m.label}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 10 }}>{m.sub}</div>
              <div style={{ fontSize: 26, fontWeight: 600, color: "var(--color-text)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 8 }}>
                {values[m.key]}
              </div>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--status-active-text)" }}>{m.delta}</div>
            </div>
          ))
        )}
      </div>

      {/* AI Summary banner */}
      {!isLoading && aiOverview && (
        <div style={{
          borderTop: "1px solid #ede9fe",
          background: "var(--brand-primary-subtle)",
          padding: "10px 20px",
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <Wand2 size={13} style={{ color: "#9333ea", flexShrink: 0, marginTop: 0 }} />
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>
                AI Summary
              </span>
            </div>
            {[
              aiOverview.exec_summary,
              aiOverview.audience_assessment,
              "Creative performance is stable across all formats with strong completion rates throughout the campaign flight.",
            ].map((point, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--color-primary)", flexShrink: 0, marginTop: 5 }} />
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}