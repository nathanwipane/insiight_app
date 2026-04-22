"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { MapPin } from "lucide-react";
import { User } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";
import SectionCard from "@/components/campaigns/detail/SectionCard";
import RankedBarList from "@/components/campaigns/detail/RankedBarList";

// ── Map placeholder ───────────────────────────────────────────────
function MapPlaceholder() {
  return (
    <div style={{
      height: "100%",
      background: "#1a1f2e",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.15,
        backgroundImage: `
          radial-gradient(circle at 40% 60%, #f97316 0%, transparent 35%),
          radial-gradient(circle at 55% 45%, #f97316 0%, transparent 20%),
          radial-gradient(circle at 50% 55%, #22c55e 0%, transparent 40%)
        `,
      }} />
      {/* Grid lines */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.08 }}>
        {[0,1,2,3,4,5].map(i => (
          <line key={"h"+i} x1="0" y1={`${i*20}%`} x2="100%" y2={`${i*20}%`} stroke="#6b7280" strokeWidth="0.5" />
        ))}
        {[0,1,2,3,4,5,6].map(i => (
          <line key={"v"+i} x1={`${i*20}%`} y1="0" x2={`${i*20}%`} y2="100%" stroke="#6b7280" strokeWidth="0.5" />
        ))}
      </svg>
      {/* Centre label */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <MapPin size={20} style={{ color: "#6b7280" }} />
        <span style={{ fontSize: 11, color: "#6b7280" }}>Map coming soon</span>
      </div>
      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 12, right: 12,
        background: "rgba(0,0,0,0.5)", borderRadius: 8,
        padding: "8px 10px", display: "flex", flexDirection: "column", gap: 4,
      }}>
        {[["#22c55e","Low"], ["#f97316","Medium"], ["#f59e0b","High"], ["#ef4444","Peak"]].map(([color, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
            <span style={{ fontSize: 9, color: "#d1d5db" }}>{label}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 6, left: 12, fontSize: 9, color: "#6b7280" }}>
        © Mapbox · Insiight
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function CampaignPerformanceTab() {
  const params      = useParams();
  const campaignId  = params.campaign_id as string;
  const { data: session } = useSession();
  const token       = (session?.user as User)?.jwt ?? "";

  const shouldFetch = !!token && !!campaignId;

  const { data: suburbsData, isLoading: suburbLoading } = useSWR<{ suburb: string; state: string; total_impressions: number }[]>(
    shouldFetch ? [`/v2/campaign/${campaignId}/suburbs`, token] : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, errorRetryCount: 3 }
  );

  const suburbItems = useMemo(() => {
    if (!suburbsData) return [];
    return suburbsData.map(s => ({
      label: `${s.suburb}, ${s.state}`,
      value: s.total_impressions,
      displayValue: s.total_impressions.toLocaleString(),
    }));
  }, [suburbsData]);
  const maxSuburb = suburbItems[0]?.value ?? 1;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16, alignItems: "stretch" }}>

      {/* Left: Map — full height */}
      <SectionCard
        title="Billboard Impressions Map"
        subtitle="Geographic spread of mobile billboard engagement"
        stretchHeight
        noPadding
        bodyStyle={{ height: "calc(100% - 57px)" }}
      >
        <MapPlaceholder />
      </SectionCard>

      {/* Right column: Suburbs + TOD stacked */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        <SectionCard
          title="Top Suburbs"
          subtitle="Total audience reach in best performing suburbs"
          bodyStyle={{ height: 320, overflowY: "auto" }}
        >
          {suburbLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ height: 28, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
              ))}
            </div>
          ) : (
            <RankedBarList items={suburbItems} maxValue={maxSuburb} />
          )}
        </SectionCard>

        <SectionCard
          title="Impressions by Time of Day"
          subtitle="Campaign impression distribution by hour"
          noPadding
          bodyStyle={{ padding: "16px 20px", height: 240 }}
        >
          <div style={{
            height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 8,
            color: "var(--color-text-muted)",
          }}>
            <span style={{ fontSize: 11 }}>Time of day data coming soon</span>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
