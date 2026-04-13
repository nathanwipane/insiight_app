"use client";

import { Eye, Users, Hash, Activity, Play } from "lucide-react";
import { MetricsData } from "@/constants/types";
import { formatImpressions } from "@/lib/campaigns";

interface CampaignStatCardsProps {
  metrics: MetricsData | null;
  isLoading?: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}

function StatCard({ icon, label, value, sub }: StatCardProps) {
  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 10,
      padding: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ color: "var(--color-text-secondary)" }}>{icon}</span>
        <span style={{
          fontSize: 10, fontWeight: 600,
          letterSpacing: "0.08em", textTransform: "uppercase",
          color: "var(--color-text-secondary)",
        }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 600, color: "var(--color-text)", letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 10, color: "var(--color-text-muted)", marginTop: 6 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 10, padding: 16,
    }}>
      <div style={{ height: 10, width: "60%", background: "var(--color-border)", borderRadius: 4, marginBottom: 12, animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ height: 24, width: "50%", background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
    </div>
  );
}

export default function CampaignStatCards({ metrics, isLoading }: CampaignStatCardsProps) {
  if (isLoading || !metrics) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  // Frequency = total impressions / total unique reach
  const frequency = metrics.total_unique_reach > 0
    ? (metrics.total_impressions / metrics.total_unique_reach).toFixed(2)
    : "—";

  const cards = [
    {
      icon: <Eye size={14} />,
      label: "Total Impressions",
      value: formatImpressions(metrics.total_impressions),
    },
    {
      icon: <Users size={14} />,
      label: "Unique Reach",
      value: formatImpressions(metrics.total_unique_reach),
    },
    {
      icon: <Hash size={14} />,
      label: "Frequency",
      value: frequency,
    },
    {
      icon: <Activity size={14} />,
      label: "Avg Daily",
      value: formatImpressions(metrics.average_daily_impressions),
    },
    {
      icon: <Play size={14} />,
      label: "Total Ad Plays",
      value: metrics.ad_plays ? formatImpressions(metrics.ad_plays) : "—",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
      {cards.map(card => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}