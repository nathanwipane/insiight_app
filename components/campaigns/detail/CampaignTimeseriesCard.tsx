"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { User } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";
import ChartTooltip from "@/components/campaigns/detail/ChartTooltip";

type TimeseriesRowV2 = { play_date: string; impressions: number; reach: number; ad_plays: number };

function shortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

export default function CampaignTimeseriesCard() {
  const params     = useParams();
  const campaignId = params.campaign_id as string;
  const { data: session } = useSession();
  const token      = (session?.user as User)?.jwt ?? "";

  const shouldFetch = !!token && !!campaignId;

  const { data: timeseriesData, isLoading } = useSWR<TimeseriesRowV2[]>(
    shouldFetch ? [`/v2/campaign/${campaignId}/timeseries`, token] : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, errorRetryCount: 3 }
  );

  const timeseries = timeseriesData ?? [];
  const chartData  = timeseries.map(d => ({
    date:        shortDate(d.play_date),
    impressions: d.impressions,
    reach:       d.reach,
  }));

  const loading = isLoading;

  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 10, overflow: "hidden",
      height: "100%", display: "flex", flexDirection: "column",
    }}>
      {/* Card header */}
      <div style={{
        padding: "12px 20px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface-alt)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text)" }}>
            Impressions over time
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
            Daily impressions and reach
          </div>
        </div>
        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {[
            { color: "var(--color-primary)",         label: "Impressions" },
            { color: "var(--color-text-secondary)",  label: "Reach" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 20, height: 2, background: color, borderRadius: 1 }} />
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ flex: 1, padding: "16px 20px", minHeight: 0 }}>
        {loading ? (
          <div style={{ height: 280, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
        ) : (
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tsImpressionsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-primary)" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tsReachGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-text-secondary)" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="var(--color-text-secondary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                  tickLine={false} axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                  tickLine={false} axisLine={false}
                  tickFormatter={(v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                />
                <Tooltip
                  content={(props: any) => (
                    <ChartTooltip
                      {...props}
                      title={props.label}
                      formatter={(payload) =>
                        payload.map((p: any) => ({
                          label: p.name,
                          value: p.value?.toLocaleString() ?? "0",
                          color: p.stroke,
                          indicator: "line",
                        }))
                      }
                    />
                  )}
                />
                <Area
                  type="monotone" dataKey="impressions" name="Impressions"
                  stroke="var(--color-primary)" strokeWidth={1.5}
                  fill="url(#tsImpressionsGrad)" dot={false}
                />
                <Area
                  type="monotone" dataKey="reach" name="Reach"
                  stroke="var(--color-text-secondary)" strokeWidth={1.5}
                  fill="url(#tsReachGrad)" dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
