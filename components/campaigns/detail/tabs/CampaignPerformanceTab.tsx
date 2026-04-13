"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { MapPin } from "lucide-react";
import { User, ImpressionsChartsType } from "@/constants/types";
import { impressionsChartsFetcher } from "@/lib/swrFetchers";
import { useIsTestOrg } from "@/hooks/useIsTestOrg";
import SectionCard from "@/components/campaigns/detail/SectionCard";
import RankedBarList, { RankedBarItem } from "@/components/campaigns/detail/RankedBarList";

// ── Chart style constants ─────────────────────────────────────────
const GRID_STYLE  = { strokeDasharray: "3 3" as const, stroke: "var(--color-border-subtle)", vertical: false as const };
const TICK_STYLE  = { fontSize: 10, fill: "var(--color-text-muted)" };
const TOOLTIP_STYLE = {
  contentStyle: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: 8, fontSize: 11, padding: "6px 10px",
  },
};

// ── Sample data ───────────────────────────────────────────────────
const SAMPLE_HOURS: Record<string, number> = {
  "0": 120, "1": 60, "2": 40, "3": 30, "4": 50, "5": 90,
  "6": 280, "7": 820, "8": 1240, "9": 1650, "10": 1900, "11": 2100,
  "12": 2450, "13": 2200, "14": 1980, "15": 2600, "16": 3100,
  "17": 3800, "18": 4200, "19": 3900, "20": 3400, "21": 2800,
  "22": 1900, "23": 980,
};

const SAMPLE_SUBURBS: Record<string, number> = {
  "Sans Souci · Ramsgate": 5898,
  "Monterey · Brighton":   4272,
  "Bondi Beach · N Bondi": 4074,
  "Dover Heights":          3939,
  "Newport":                3702,
  "Randwick North":         3429,
  "Botany":                 3351,
  "Mascot":                 3351,
  "Bondi Jcn · Waverly":   3234,
  "Yarraville":             2958,
};

// ── Time of day range options ─────────────────────────────────────
const TOD_RANGES = ["Maximum", "Last 30 days", "Last 7 days"] as const;
type TodRange = typeof TOD_RANGES[number];

// ── Helpers ───────────────────────────────────────────────────────
function hourDataToChart(data: Record<string, number>) {
  return Array.from({ length: 24 }, (_, i) => ({
    h: String(i),
    v: data[String(i)] ?? 0,
  }));
}

function suburbDataToItems(data: Record<string, number>): RankedBarItem[] {
  return Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({
      label: name,
      value,
      displayValue: value.toLocaleString(),
    }));
}

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
  const isTestOrg   = useIsTestOrg();
  const [todRange, setTodRange] = useState<TodRange>("Maximum");

  const hourBody: ImpressionsChartsType  = { impressions_by_hour: true };
  const suburbBody: ImpressionsChartsType = { impressions_by_suburb: true };

  const shouldFetch = !isTestOrg && !!token && !!campaignId;

  const { data: hourResp, isLoading: hourLoading } = useSWR(
    shouldFetch ? [`/get-impressions-charts/${campaignId}?is_asset=false`, token, hourBody] : null,
    impressionsChartsFetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, revalidateOnReconnect: true, errorRetryCount: 3 }
  );

  const { data: suburbResp, isLoading: suburbLoading } = useSWR(
    shouldFetch ? [`/get-impressions-charts/${campaignId}?is_asset=false`, token, suburbBody] : null,
    impressionsChartsFetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, revalidateOnReconnect: true, errorRetryCount: 3 }
  );

  const hourData   = isTestOrg ? SAMPLE_HOURS   : (hourResp?.data?.impressions_by_hour   ?? {});
  const suburbData = isTestOrg ? SAMPLE_SUBURBS : (suburbResp?.data?.impressions_by_suburb ?? {});

  const chartData   = useMemo(() => hourDataToChart(hourData), [hourData]);
  const suburbItems = useMemo(() => suburbDataToItems(suburbData), [suburbData]);
  const maxSuburb   = suburbItems[0]?.value ?? 1;

  const todRangeAction = (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {TOD_RANGES.map(r => (
        <button
          key={r}
          onClick={() => setTodRange(r)}
          style={{
            height: 26, padding: "0 8px",
            fontSize: 11, borderRadius: 5, cursor: "pointer",
            fontWeight: todRange === r ? 600 : 400,
            background: todRange === r ? "var(--color-text)" : "transparent",
            color: todRange === r ? "var(--color-surface)" : "var(--color-text-secondary)",
            border: "none",
          }}
        >
          {r}
        </button>
      ))}
    </div>
  );

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
          {suburbLoading && !isTestOrg ? (
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
          action={todRangeAction}
          noPadding
          bodyStyle={{ padding: "16px 20px", height: 240 }}
        >
          {hourLoading && !isTestOrg ? (
            <div style={{ height: 192, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
          ) : (
            <div style={{ height: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--color-text)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--color-text)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                  <XAxis dataKey="h" tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} tickLine={false} axisLine={false}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                  />
                  <Tooltip />
                  <Area
                    type="monotone" dataKey="v"
                    stroke="var(--color-text)" strokeWidth={1.5}
                    fill="url(#hourGrad)" dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}