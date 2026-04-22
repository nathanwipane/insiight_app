"use client";

import { useState } from "react";
import { Sparkles, ChevronDown } from "lucide-react";
import { CampaignAIOverview } from "@/constants/types";

interface CampaignAISummaryProps {
  data: CampaignAIOverview | null;
  isLoading?: boolean;
}

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

export default function CampaignAISummary({ data, isLoading }: CampaignAISummaryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 10, overflow: "hidden",
      minHeight: 220,
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 20px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface-alt)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={12} style={{ color: "var(--color-text-secondary)" }} />
          <span style={{
            fontSize: 10, fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase",
            color: "var(--color-text-secondary)",
          }}>
            Campaign Overview · AI Summary
          </span>
        </div>
        {!isLoading && data && (
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
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {isLoading || !data ? (
          <>
            <div style={{ height: 12, width: "90%", background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 12, width: "75%", background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
          </>
        ) : (
          <>
            <AIPoint>{data.executive_summary}</AIPoint>
            {expanded && data.target_summary && (
              <AIPoint>{data.target_summary}</AIPoint>
            )}
          </>
        )}
      </div>
    </div>
  );
}