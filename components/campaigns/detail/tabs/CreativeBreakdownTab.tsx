"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Film } from "lucide-react";
import { User } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";
import { formatImpressions } from "@/lib/campaigns";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

type CreativeItemV2 = {
  creative_id: string;
  total_impressions: number;
  total_ad_plays: number;
  avg_impressions_per_play: number;
  total_hours_played: number;
  first_play_date: string;
  last_play_date: string;
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

// ── Main component ────────────────────────────────────────────────
export default function CreativeBreakdownTab() {
  const params     = useParams();
  const campaignId = params.campaign_id as string;
  const { data: session } = useSession();
  const token      = (session?.user as User)?.jwt ?? "";

  const shouldFetch = !!token && !!campaignId;

  const { data: creativeData, isLoading } = useSWR<CreativeItemV2[]>(
    shouldFetch ? [`/v2/campaign/${campaignId}/creative`, token] : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, errorRetryCount: 3 }
  );

  const loading = isLoading;

  // ── Derive creative entries ───────────────────────────────────
  const creativeEntries = useMemo(() => {
    if (!creativeData) return [];
    return [...creativeData].sort((a, b) => b.total_impressions - a.total_impressions);
  }, [creativeData]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Creative cards ── */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 10, overflow: "hidden" }}>
              <Skeleton height={112} borderRadius={0} />
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <Skeleton height={10} width="60%" />
                <Skeleton height={10} width="40%" />
              </div>
            </div>
          ))}
        </div>
      ) : creativeEntries.length === 0 ? (
        <EmptyState
          title="No creative data"
          subtitle="Creative performance data will appear here once available."
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(creativeEntries.length, 3)}, 1fr)`, gap: 12 }}>
          {creativeEntries.map((item, idx) => {
            const topImpressions = creativeEntries[0]?.total_impressions ?? 1;
            const isTop = item.total_impressions === topImpressions;
            return (
              <div key={item.creative_id} style={{
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
                    <span style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", padding: "0 12px" }}>{item.creative_id}</span>
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
                    <CreativeStat label="Ad Plays"    value={item.total_ad_plays.toLocaleString()} />
                    <CreativeStat label="Impressions" value={formatImpressions(item.total_impressions)} />
                    <CreativeStat label="First Played" value={new Date(item.first_play_date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })} />
                  </div>
                  <div style={{ borderTop: "1px solid var(--color-border-subtle)", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                    <span style={{ color: "var(--color-text-muted)" }}>Last played</span>
                    <span style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}>
                      {new Date(item.last_play_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "2-digit" })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
