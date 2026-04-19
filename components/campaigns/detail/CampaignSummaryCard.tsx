"use client";

import { useState } from "react";
import { Sparkles, ChevronDown } from "lucide-react";
import { MetricsData, CampaignAIOverview } from "@/constants/types";
import { formatImpressions } from "@/lib/campaigns";

// ── Helpers ───────────────────────────────────────────────────────
function AIPoint({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <div style={{
        width: 4, height: 4, borderRadius: "50%",
        background: "var(--color-text-muted)",
        flexShrink: 0, marginTop: 7,
      }} />
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.7, margin: 0 }}>
        {children}
      </p>
    </div>
  );
}

function MetricCell({ label, value, sub, isLast }: { label: string; value: string; sub?: string; isLast?: boolean }) {
  return (
    <div style={{
      padding: "14px 20px",
      borderRight: isLast ? "none" : "1px solid var(--color-border)",
    }}>
      <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 600, color: "var(--color-text)", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────────
interface CampaignSummaryCardProps {
  metrics: MetricsData | null;
  metricsLoading?: boolean;
  aiOverview?: CampaignAIOverview | null;
}

export default function CampaignSummaryCard({ metrics, metricsLoading, aiOverview }: CampaignSummaryCardProps) {
  const [expanded, setExpanded] = useState(false);

  const frequency = metrics && metrics.total_unique_reach > 0
    ? (metrics.total_impressions / metrics.total_unique_reach).toFixed(2)
    : "—";

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
          Overview
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
          Campaign performance summary
        </div>
      </div>

      {/* AI Summary */}
      {aiOverview && (
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={12} style={{ color: "var(--color-text-secondary)" }} />
              <span style={{
                fontSize: 10, fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
                color: "var(--color-text-secondary)",
              }}>
                AI Summary
              </span>
            </div>
            <button
              onClick={() => setExpanded(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 11, color: "var(--color-text-secondary)",
                background: "none", border: "none", cursor: "pointer", padding: 0,
              }}
            >
              {expanded ? "Collapse" : "See more"}
              <ChevronDown
                size={10}
                style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
              />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <AIPoint>{aiOverview.exec_summary}</AIPoint>
            {expanded && aiOverview.audience_assessment && (
              <AIPoint>{aiOverview.audience_assessment}</AIPoint>
            )}
          </div>
        </div>
      )}

      {/* Metrics row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)" }}>
        {metricsLoading || !metrics ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              padding: "14px 20px",
              borderRight: i < 4 ? "1px solid var(--color-border)" : "none",
            }}>
              <div style={{ height: 12, width: "60%", background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite", marginBottom: 8 }} />
              <div style={{ height: 24, width: "40%", background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
            </div>
          ))
        ) : (
          <>
            <MetricCell label="Total impressions" value={formatImpressions(metrics.total_impressions)} />
            <MetricCell label="Unique reach"      value={formatImpressions(metrics.total_unique_reach)} />
            <MetricCell label="Frequency"         value={frequency} />
            <MetricCell label="Avg daily"         value={formatImpressions(metrics.average_daily_impressions)} />
            <MetricCell label="Total ad plays"    value={metrics.ad_plays ? formatImpressions(metrics.ad_plays) : "—"} sub="Campaign to date" isLast />
          </>
        )}
      </div>
    </div>
  );
}
