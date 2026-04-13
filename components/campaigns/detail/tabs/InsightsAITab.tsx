"use client";

import { Sparkles } from "lucide-react";
import { CampaignAIOverview } from "@/constants/types";

// ── Types ─────────────────────────────────────────────────────────
type InsightType = "strength" | "opportunity" | "watch";

interface Insight {
  type: InsightType;
  title: string;
  body: string;
  metric: string;
  tag: string;
}

interface ScoreCardData {
  label: string;
  score: number;
  desc: string;
  warn?: boolean;
}

// ── Static score cards ────────────────────────────────────────────
const SCORE_CARDS: ScoreCardData[] = [
  { label: "Audience Quality",       score: 87, desc: "Strong match to target demo" },
  { label: "Creative Effectiveness", score: 91, desc: "High completion + dwell" },
  { label: "Geographic Coverage",    score: 74, desc: "Some markets under-indexed" },
  { label: "Frequency Health",       score: 68, desc: "Approaching optimal threshold", warn: true },
];

// ── Sample insights ───────────────────────────────────────────────
const SAMPLE_INSIGHTS: Insight[] = [
  {
    type: "strength",
    title: "Peak performance window identified",
    body: "Impressions spike 38% above campaign average between 16:00–19:00. Concentrating future spend in this window would increase efficiency without additional budget.",
    metric: "38% above avg",
    tag: "Timing",
  },
  {
    type: "strength",
    title: "Affluent suburban audience over-delivery",
    body: "The campaign over-delivered against high household income segments by 13 index points, aligning well with the target demographic for a premium release.",
    metric: "113 index score",
    tag: "Audience",
  },
  {
    type: "opportunity",
    title: "Top creative outperforms at lower cost",
    body: "The highest-performing creative generated comparable reach to the extended format at lower dwell cost. Reallocating budget could improve overall ROI by an estimated 18%.",
    metric: "Est. +18% ROI",
    tag: "Creative",
  },
  {
    type: "opportunity",
    title: "Under-indexed markets vs. network share",
    body: "Some markets delivered below their share of the active network. Expanding route coverage in those areas could unlock significant additional impressions.",
    metric: "~200k impressions",
    tag: "Geography",
  },
  {
    type: "watch",
    title: "80+ age segment reach is thin",
    body: "Only a small fraction of impressions reached the 80+ segment. If this demographic is relevant to future briefs, routes near retirement-dense suburbs should be prioritised.",
    metric: "2.2% of reach",
    tag: "Audience",
  },
  {
    type: "watch",
    title: "Frequency ceiling approaching in some markets",
    body: "Frequency in select markets has risen above the 6× optimal threshold. Continued delivery risks audience fatigue on future campaigns in those areas.",
    metric: "8.1× frequency",
    tag: "Frequency",
  },
];

// ── Insight type config ───────────────────────────────────────────
const INSIGHT_CFG: Record<InsightType, { dotColor: string; tagBg: string; tagColor: string; tagBorder: string }> = {
  strength:    { dotColor: "#34d399", tagBg: "#ecfdf5", tagColor: "#065f46", tagBorder: "#a7f3d0" },
  opportunity: { dotColor: "var(--color-text)", tagBg: "var(--color-surface-alt)", tagColor: "var(--color-text-secondary)", tagBorder: "var(--color-border)" },
  watch:       { dotColor: "#f59e0b", tagBg: "#fffbeb", tagColor: "#92400e", tagBorder: "#fcd34d" },
};

// ── Sub-components ────────────────────────────────────────────────
function ScoreCard({ label, score, desc, warn }: ScoreCardData) {
  const color = warn
    ? "#f59e0b"
    : score >= 85 ? "var(--color-text)"
    : score >= 70 ? "var(--color-text-secondary)"
    : "var(--color-text-muted)";

  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 10, padding: 16,
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-secondary)", marginBottom: 12 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 600, color: "var(--color-text)", letterSpacing: "-0.03em", lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: 10, color: "var(--color-text-muted)", marginBottom: 2 }}>/ 100</span>
      </div>
      <div style={{ height: 3, background: "var(--color-border-subtle)", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: 99 }} />
      </div>
      <div style={{ fontSize: 10, color: "var(--color-text-muted)" }}>{desc}</div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const cfg = INSIGHT_CFG[insight.type];
  return (
    <div
      style={{
        display: "flex", alignItems: "flex-start", gap: 16,
        padding: "14px 20px",
        borderBottom: "1px solid var(--color-border-subtle)",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-alt)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dotColor, flexShrink: 0, marginTop: 6 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text)", lineHeight: 1.4, flex: 1 }}>
            {insight.title}
          </span>
          <span style={{
            fontSize: 9, fontWeight: 500, padding: "2px 7px",
            borderRadius: 999, border: `1px solid ${cfg.tagBorder}`,
            background: cfg.tagBg, color: cfg.tagColor, flexShrink: 0,
          }}>
            {insight.tag}
          </span>
        </div>
        <p style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
          {insight.body}
        </p>
      </div>
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text)", whiteSpace: "nowrap" }}>
          {insight.metric}
        </span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
interface InsightsAITabProps {
  aiOverview?: CampaignAIOverview | null;
}

export default function InsightsAITab({ aiOverview }: InsightsAITabProps) {
  const strengthCount    = SAMPLE_INSIGHTS.filter(i => i.type === "strength").length;
  const opportunityCount = SAMPLE_INSIGHTS.filter(i => i.type === "opportunity").length;
  const watchCount       = SAMPLE_INSIGHTS.filter(i => i.type === "watch").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Score cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {SCORE_CARDS.map(card => <ScoreCard key={card.label} {...card} />)}
      </div>

      {/* Insights list */}
      <div style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 10, overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "10px 20px",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface-alt)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <Sparkles size={12} style={{ color: "var(--color-text-secondary)", flexShrink: 0 }} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-secondary)" }}>
            Insights AI · Automated Analysis
          </span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            {[
              { count: strengthCount,    color: "#34d399",             label: "strength" },
              { count: opportunityCount, color: "var(--color-text)",   label: "opportunit", plural: "ies", singular: "y" },
              { count: watchCount,       color: "#f59e0b",             label: "watch item" },
            ].map(({ count, color, label, plural, singular }) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--color-text-secondary)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
                {count} {label}{plural ? (count !== 1 ? plural : singular) : (count !== 1 ? "s" : "")}
              </span>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div>
          {SAMPLE_INSIGHTS.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </div>
      </div>
    </div>
  );
}