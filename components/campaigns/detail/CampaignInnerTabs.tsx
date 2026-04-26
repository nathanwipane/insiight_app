"use client";

import { Sparkles } from "lucide-react";

export type InnerTab = "performance" | "audience" | "creative" | "ai";

const TABS: { key: InnerTab; label: string; spark?: boolean }[] = [
  { key: "performance", label: "Campaign Performance" },
  { key: "audience",    label: "Audience Insights" },
  { key: "creative",    label: "Creative Breakdown" },
  // { key: "ai",          label: "Insights AI", spark: true },    ← AI tab is currently disabled pending further development 
];

interface CampaignInnerTabsProps {
  activeTab: InnerTab;
  onTabChange: (tab: InnerTab) => void;
}

export default function CampaignInnerTabs({ activeTab, onTabChange }: CampaignInnerTabsProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 2,
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 8, padding: 4, width: "fit-content",
    }}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 12px",
              fontSize: 11, fontWeight: isActive ? 500 : 400,
              color: isActive ? "var(--color-surface)" : "var(--color-text-secondary)",
              background: isActive ? "var(--color-text)" : "transparent",
              border: "none", borderRadius: 6, cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {tab.spark && <Sparkles size={10} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}