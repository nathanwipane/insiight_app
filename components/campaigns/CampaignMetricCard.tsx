// ––––––––––– components/campaigns/CampaignMetricCard.tsx –––––––––––
"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface CampaignMetricCardProps {
  label: string;
  value: string;
  sub?: string;
  delta?: string; // e.g. "+18.4%" or "-3.2%"
  noBorder?: boolean;
}

export default function CampaignMetricCard({ label, value, sub, delta, noBorder }: CampaignMetricCardProps) {
  const isPositive = delta ? !delta.startsWith("-") : true;

  return (
    <div style={{
      padding: "0 0 20px",
      borderBottom: noBorder ? "none" : "1px solid var(--color-border)",
    }}>
      <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
        <span style={{ fontSize: 24, fontWeight: 500, color: "var(--color-text)", letterSpacing: "-0.03em", lineHeight: 1 }}>
          {value}
        </span>
        {delta && (
          <span style={{
            fontSize: 11, fontWeight: 500,
            color: isPositive ? "var(--status-active-text)" : "#dc2626",
            display: "flex", alignItems: "center", gap: 2,
          }}>
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {delta}
          </span>
        )}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}