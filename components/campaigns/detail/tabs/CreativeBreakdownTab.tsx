"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { Film } from "lucide-react";
import { User, CreativeBreakdownResponse, CreativeBreakdownItem } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";
import { useIsTestOrg } from "@/hooks/useIsTestOrg";
import { formatImpressions } from "@/lib/campaigns";
import SectionCard from "@/components/campaigns/detail/SectionCard";

// ── Chart style constants ─────────────────────────────────────────
const GRID_STYLE = { strokeDasharray: "3 3" as const, stroke: "var(--color-border-subtle)", vertical: false as const };
const TICK_STYLE = { fontSize: 10, fill: "var(--color-text-muted)" };

// ── Sample data ───────────────────────────────────────────────────
const SAMPLE_CREATIVE: CreativeBreakdownResponse = {
  creative_breakdown: {
    "Launch 15s": { ad_plays: 24810, impressions: 1204450, reach: 198200, url: "", first_played: "2026-02-02", last_played: "2026-03-09" },
    "Teaser 10s": { ad_plays: 19640, impressions: 980720,  reach: 162400, url: "", first_played: "2026-02-02", last_played: "2026-03-09" },
    "Extended 30s": { ad_plays: 13790, impressions: 686750, reach: 112800, url: "", first_played: "2026-02-02", last_played: "2026-03-09" },
  },
};

// ── Helpers ───────────────────────────────────────────────────────
function CreativeStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", lineHeight: 1, marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text)" }}>
        {value}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{label}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function CreativeBreakdownTab() {
  const params     = useParams();
  const campaignId = params.campaign_id as string;
  const { data: session } = useSession();
  const token      = (session?.user as User)?.jwt ?? "";
  const isTestOrg  = useIsTestOrg();

  const shouldFetch = !isTestOrg && !!token && !!campaignId;

  const { data: creativeResp, isLoading } = useSWR<CreativeBreakdownResponse>(
    shouldFetch ? [`/get-campaign-creative-breakdown/${campaignId}`, token] : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, errorRetryCount: 3 }
  );

  const creative = isTestOrg ? SAMPLE_CREATIVE : creativeResp;
  const loading  = !isTestOrg && isLoading;

  // ── Derive creative entries ───────────────────────────────────
  const creativeEntries = useMemo((): [string, CreativeBreakdownItem][] => {
    if (!creative?.creative_breakdown) return [];
    return Object.entries(creative.creative_breakdown)
      .sort(([, a], [, b]) => b.impressions - a.impressions);
  }, [creative]);

  // ── Build bar chart data (impressions by creative name) ───────
  // Groups creatives into generic "Creative 1", "Creative 2" etc
  // In real data creative names from keys become the series labels
  const barColors = ["var(--color-text)", "var(--color-text-secondary)", "var(--color-text-muted)"];

  const marketChartData = useMemo(() => {
    // Placeholder — real data would need a per-market breakdown endpoint
    // For now show impressions per creative as a single-axis bar chart
    return creativeEntries.map(([name, item], i) => ({
      name: name.length > 14 ? name.slice(0, 12) + "…" : name,
      impressions: item.impressions,
      reach: item.reach,
      plays: item.ad_plays,
      color: barColors[i] ?? "var(--color-text-muted)",
    }));
  }, [creativeEntries]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Creative cards ── */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ height: 112, background: "var(--color-border)", animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ height: 10, width: "60%", background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
                <div style={{ height: 10, width: "40%", background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(creativeEntries.length, 3)}, 1fr)`, gap: 12 }}>
          {creativeEntries.map(([name, item], idx) => {
            const totalForTop = creativeEntries[0]?.[1]?.impressions ?? 1;
            const isTop = item.impressions === totalForTop;
            return (
              <div key={name} style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 10, overflow: "hidden",
              }}>
                {/* Thumbnail */}
                <div style={{
                  height: 112, background: "#1a1f2e",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #1f2937, #111827)", opacity: 0.85 }} />
                  <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <Film size={18} style={{ color: "#6b7280" }} />
                    <span style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", padding: "0 12px" }}>{name}</span>
                  </div>
                  {/* Badges */}
                  <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4 }}>
                    {isTop && (
                      <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(16,185,129,0.2)", color: "#34d399", fontWeight: 500 }}>
                        top
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ padding: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <CreativeStat label="Ad Plays"    value={item.ad_plays.toLocaleString()} />
                    <CreativeStat label="Impressions" value={formatImpressions(item.impressions)} />
                    <CreativeStat label="Reach"       value={item.reach.toLocaleString()} />
                    <CreativeStat label="First Played" value={new Date(item.first_played).toLocaleDateString("en-AU", { day: "numeric", month: "short" })} />
                  </div>
                  <div style={{ borderTop: "1px solid var(--color-border-subtle)", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                    <span style={{ color: "var(--color-text-muted)" }}>Last played</span>
                    <span style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}>
                      {new Date(item.last_played).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "2-digit" })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Impressions by creative ── */}
      <SectionCard
        title="Impressions by Creative"
        subtitle="Total impressions and reach per creative"
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LegendDot color="var(--color-text)" label="Impressions" />
            <LegendDot color="var(--color-text-secondary)" label="Reach" />
          </div>
        }
      >
        {loading ? (
          <div style={{ height: 200, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
        ) : (
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketChartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }} barCategoryGap="30%" barGap={3}>
                <CartesianGrid {...GRID_STYLE} />
                <XAxis dataKey="name" tick={TICK_STYLE} tickLine={false} axisLine={false} />
                <YAxis tick={TICK_STYLE} tickLine={false} axisLine={false}
                  tickFormatter={(v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                <Tooltip />
                <Bar dataKey="impressions" fill="var(--color-text)"           radius={[3, 3, 0, 0]} />
                <Bar dataKey="reach"       fill="var(--color-text-secondary)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionCard>

      {/* ── Ad plays trend ── */}
      <SectionCard
        title="Ad Plays by Creative"
        subtitle="Total ad plays per creative asset"
      >
        {loading ? (
          <div style={{ height: 160, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
        ) : (
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketChartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }} barCategoryGap="40%">
                <CartesianGrid {...GRID_STYLE} />
                <XAxis dataKey="name" tick={TICK_STYLE} tickLine={false} axisLine={false} />
                <YAxis tick={TICK_STYLE} tickLine={false} axisLine={false}
                  tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                <Tooltip />
                <Bar dataKey="plays" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionCard>
    </div>
  );
}