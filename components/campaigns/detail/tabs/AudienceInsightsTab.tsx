"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend, ReferenceLine
} from "recharts";
import { User } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";
import SectionCard from "@/components/campaigns/detail/SectionCard";
import RankedBarList, { RankedBarItem } from "@/components/campaigns/detail/RankedBarList";
import IndexChart from "@/components/campaigns/detail/IndexChart";
import ChartTooltip from "@/components/campaigns/detail/ChartTooltip";

// ── Chart style constants ─────────────────────────────────────────
const GRID_STYLE    = { strokeDasharray: "3 3" as const, stroke: "var(--color-border-subtle)", vertical: false as const };
const TICK_STYLE    = { fontSize: 12, fill: "var(--color-text)" };
const TOOLTIP_STYLE = {
  contentStyle: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: 8, fontSize: 13, padding: "6px 10px",
  },
};

  const EDUCATION_COLORS = [
    "#ad46ff",
    "#c47dff",
    "#d9a8ff",
  ];

const HH_INCOME_BINS = [
  { key: "hh_inc_under_26k", label: "Under $26K", weeklyMax: 499 },
  { key: "hh_inc_26k_52k",   label: "$26K–$52K",  weeklyMax: 999 },
  { key: "hh_inc_52k_91k",   label: "$52K–$91K",  weeklyMax: 1749 },
  { key: "hh_inc_91k_156k",  label: "$91K–$156K", weeklyMax: 2999 },
  { key: "hh_inc_156k_plus", label: "$156K+",     weeklyMax: Infinity },
];

function weeklyToLabel(weeklyValue: number | null): string | null {
  if (!weeklyValue) return null;
  const bin = HH_INCOME_BINS.find(b => weeklyValue <= b.weeklyMax);
  return bin?.label ?? "$156K+";
}

function weeklyToAnnualLabel(weeklyValue: number | null): string {
  if (!weeklyValue) return "";
  const annual = weeklyValue * 52;
  const rounded = Math.round(annual / 1000);
  return `$${rounded}K`;
}

// ── Types ─────────────────────────────────────────────────────────
type DemoSegment = {
  segment_type: string;
  data: { key: string; label: string; proportion: number; index: number }[];
  total_weight: number;
};

// ── Helpers ───────────────────────────────────────────────────────
function findSegment(data: DemoSegment[] | undefined, type: string) {
  return data?.find(s => s.segment_type === type)?.data ?? [];
}

// ── Loading skeleton ──────────────────────────────────────────────
function SkeletonRows({ count = 6 }: { count?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ height: 24, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite", opacity: 1 - i * 0.1 }} />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function AudienceInsightsTab({
  impressions = 0,
  campaign,
}: {
  impressions?: number;
  campaign?: any;
}) {
  const params     = useParams();
  const campaignId = params.campaign_id as string;
  const { data: session } = useSession();
  const token      = (session?.user as User)?.jwt ?? "";

  const shouldFetch = !!token && !!campaignId;

  const { data: demographicsData, isLoading } = useSWR<DemoSegment[]>(
    shouldFetch ? [`/v2/campaign/${campaignId}/demographics`, token] : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, errorRetryCount: 3 }
  );

  const loading = isLoading;

  // ── Derived data ────────────────────────────────────────────────
  const genderSegment = findSegment(demographicsData, 'gender');
  const genderItems: RankedBarItem[] = useMemo(() => {
    return genderSegment.map(g => ({
      label: g.label,
      value: g.proportion,
      displayValue: `${(g.proportion * 100).toFixed(1)}%`,
    })).sort((a, b) => b.value - a.value);
  }, [genderSegment]);

  const overIndexedItems: { label: string; index: number }[] = useMemo(() => {
    if (!demographicsData) return [];
    return demographicsData
      .flatMap(s => s.data.map(d => ({ ...d, segment_type: s.segment_type })))
      .filter(d => d.index > 110)
      .sort((a, b) => b.index - a.index)
      .slice(0, 5)
      .map(d => ({
        label: d.label,
        index: d.index,
      }));
  }, [demographicsData]);

  const ageChartData = useMemo(() => {
    const raw = findSegment(demographicsData, 'age');

    const BUCKETS = [
      { label: "20–34", keys: ["age_20_24", "age_25_29", "age_30_34"] },
      { label: "35–49", keys: ["age_35_39", "age_40_44", "age_45_49"] },
      { label: "50–64", keys: ["age_50_54", "age_55_59", "age_60_64"] },
      { label: "65–80", keys: ["age_65_69", "age_70_74", "age_75_79", "age_80_84"] },
      { label: "80+",   keys: ["age_85_plus"] },
    ];

    return BUCKETS.map(bucket => {
      const segments = raw.filter(d => bucket.keys.includes(d.key));
      const proportion = segments.reduce((sum, d) => sum + d.proportion, 0);
      const rawReach = Math.round(proportion * impressions);

      // Build tooltip detail — individual sub-buckets
      const detail = segments.map(d => ({
        label: d.label,
        reach: Math.round(d.proportion * impressions),
        pct: (d.proportion * 100).toFixed(1),
      }));

      return {
        group: bucket.label,
        v: rawReach,
        proportion: parseFloat((proportion * 100).toFixed(1)),
        detail,
      };
    });
  }, [demographicsData, impressions]);

  const occupationItems: RankedBarItem[] = useMemo(() => {
    return findSegment(demographicsData, 'occupation')
      .sort((a, b) => b.proportion - a.proportion)
      .slice(0, 6)
      .map(d => ({
        label: d.label,
        value: d.proportion,
        displayValue: Math.round(d.proportion * impressions).toLocaleString(),
      }));
  }, [demographicsData]);

  const educationItems: RankedBarItem[] = useMemo(() => {
    return findSegment(demographicsData, 'education')
      .sort((a, b) => b.proportion - a.proportion)
      .map(d => ({
        label: d.label,
        value: d.proportion,
        displayValue: `${(d.proportion * 100).toFixed(1)}%`,
      }));
  }, [demographicsData]);

  const hhIncomeData = useMemo(() => {
    return findSegment(demographicsData, 'hh_income').map(d => ({
      range: d.label,
      v: Math.round(d.proportion * impressions),
      proportion: parseFloat((d.proportion * 100).toFixed(1)),
    }));
  }, [demographicsData]);

  const audienceMedianLabel = weeklyToLabel(
    campaign?.hh_income_median_audience ?? null
  );
  const regionMedianLabel = weeklyToLabel(
    campaign?.hh_income_median_region ?? null
  );

  const mediansInSameBin =
    audienceMedianLabel !== null &&
    audienceMedianLabel === regionMedianLabel;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Row 1: Gender + Over-indexed */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        <SectionCard
          title="Gender Distribution"
          subtitle="Audience impressions by gender"
        >
          {loading ? <SkeletonRows count={2} /> : (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 260,
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                padding: 0,
              }}>

              {/* Left — donut chart */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {(() => {
                  const male = genderItems.find(g => g.label.toLowerCase().includes("male") && !g.label.toLowerCase().includes("female"));
                  const female = genderItems.find(g => g.label.toLowerCase().includes("female"));
                  const malePct = male ? Math.round(male.value * 100) : 51;
                  const femalePct = female ? Math.round(female.value * 100) : 49;
                  const totalReach = impressions;
                  const circumference = 2 * Math.PI * 28;
                  return (
                    <svg width="180" height="180" viewBox="0 0 70 70">
                      {/* Background ring */}
                      <circle cx="35" cy="35" r="28" fill="none"
                        stroke="var(--color-border)" strokeWidth="9"/>
                      {/* Female arc (primary colour) */}
                      <circle cx="35" cy="35" r="28" fill="none"
                        stroke="var(--color-text)" strokeWidth="9"
                        strokeDasharray={`${malePct * 1.759} ${(100 - malePct) * 1.759}`}
                        strokeDashoffset="44" strokeLinecap="butt"/>
                      {/* Male arc */}
                      <circle cx="35" cy="35" r="28" fill="none"
                        stroke="#aaaaaa" strokeWidth="9"
                        strokeDasharray={`${femalePct * 1.759} ${(100 - femalePct) * 1.759}`}
                        strokeDashoffset={`${44 - malePct * 1.759}`}
                        strokeLinecap="butt"/>
                      {/* Centre text */}
                      <text x="35" y="33" textAnchor="middle"
                        fill="var(--color-text)" fontSize="8" fontWeight="700">
                        {totalReach.toLocaleString()}
                      </text>
                      <text x="35" y="43" textAnchor="middle"
                        fill="var(--color-text-muted)" fontSize="6">
                        Impressions
                      </text>
                    </svg>
                  );
                })()}
              </div>

              {/* Right — legend */}
              <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                paddingLeft: 16,
              }}>
                {genderItems.map((g, i) => {
                  const isFemale = g.label.toLowerCase().includes("female");
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: !isFemale
                          ? "#aaaaaa"
                          : "var(--color-text)",
                        flexShrink: 0,
                      }} />
                      <div style={{
                        fontSize: 14,
                        fontWeight: 400,
                        color: "var(--color-text)",
                      }}>
                        {g.label} <span style={{ fontWeight: 600 }}>{g.displayValue}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Over-Indexed Audiences"
          subtitle="Segments performing above city average (100)"
        >
          {loading ? <SkeletonRows count={5} /> : (
            <IndexChart items={overIndexedItems} />
          )}
        </SectionCard>
      </div>

      {/* Row 2: Age (bar chart) + Occupation (ranked list) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        <SectionCard
          title="Age Distribution"
          subtitle="Campaign impressions by audience age groups"
        >
          {loading ? (
            <div style={{ height: 200, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
          ) : (
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barCategoryGap="20%">
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="group" tick={TICK_STYLE} tickLine={false} axisLine={false} />
                  <YAxis tick={TICK_STYLE} tickLine={false} axisLine={false}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`}
                    domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]} />
                  <Tooltip
                    content={(props: any) => {
                      const d = props.payload?.[0]?.payload;
                      if (!d) return null;
                      return (
                        <ChartTooltip
                          {...props}
                          title={`Age ${props.label}: ${d.v?.toLocaleString()} impressions`}
                          rows={[
                            { label: "% of audience", value: `${d.proportion}%` },
                            ...(d.detail ?? []).map((item: any) => ({
                              label: item.label,
                              value: `${item.reach?.toLocaleString()} (${item.pct}%)`,
                            })),
                          ]}
                        />
                      );
                    }}
                  />
                  <Bar dataKey="v" fill="var(--color-text)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Audience by Occupation" subtitle="Understand the background of your impressions">
          {loading ? <SkeletonRows count={7} /> : (
            <RankedBarList items={occupationItems} />
          )}
        </SectionCard>
      </div>

      {/* Row 3: Education (ranked list) + Income (bar chart) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        <SectionCard title="Education Level Distribution"
          subtitle="Highest levels of education in your audience">
          {loading ? <SkeletonRows count={3} /> : (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 260,
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
              }}>
                {/* Left — pie chart */}
                <div style={{ width: 295, height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={educationItems.map(e => ({
                          name: e.label,
                          value: parseFloat((e.value * 100).toFixed(1)),
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ value, cx, cy, midAngle, innerRadius, outerRadius }: any) => {
                          const RADIAN = Math.PI / 180;
                          const radius = outerRadius + 10;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text
                              x={x} y={y}
                              textAnchor={x > cx ? "start" : "end"}
                              dominantBaseline="central"
                              style={{ fontSize: 14, fontWeight: 600, fill: "var(--color-text)" }}
                            >
                              {value}%
                            </text>
                          );
                        }}
                        labelLine={false}
                      >
                        {educationItems.map((_, i) => (
                          <Cell
                            key={i}
                            fill={EDUCATION_COLORS[i % EDUCATION_COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Right — legend */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  minWidth: 160,
                }}>
                  {educationItems.map((e, i) => (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}>
                      <div style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: EDUCATION_COLORS[i % EDUCATION_COLORS.length],
                        flexShrink: 0,
                      }} />
                      <div style={{
                        fontSize: 14,
                        fontWeight: 400,
                        color: "var(--color-text)",
                      }}>
                        {e.label} <span style={{ fontWeight: 600 }}>{e.displayValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Household Income Distribution"
          subtitle="Annual household income ranges in your audience"
        >
          {loading ? (
            <div style={{ height: 200, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
          ) : (
            <div style={{ height: 285 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hhIncomeData} margin={{ top: 30, right: 10, left: -15, bottom: 0 }} barCategoryGap="20%">
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="range" tick={{ ...TICK_STYLE, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={TICK_STYLE} tickLine={false} axisLine={false}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`}
                    domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]} />
                  <Tooltip
                    content={(props: any) => {
                      const d = props.payload?.[0]?.payload;
                      if (!d) return null;
                      return (
                        <ChartTooltip
                          {...props}
                          title={`${props.label}: ${d.v?.toLocaleString()} impressions`}
                          rows={[
                            { label: "% of audience", value: `${d.proportion}%` },
                          ]}
                        />
                      );
                    }}
                  />
                  <Bar dataKey="v" fill="var(--color-text)" radius={[3, 3, 0, 0]} />
                  {audienceMedianLabel && (
                    <ReferenceLine
                      x={audienceMedianLabel}
                      stroke="var(--color-primary)"
                      strokeWidth={1}
                      strokeDasharray="10 3"
                      label={{
                        value: `Audience Median ${weeklyToAnnualLabel(campaign?.hh_income_median_audience ?? null)}`,
                        position: mediansInSameBin ? "insideTop" : "top",
                        offset: mediansInSameBin ? -30 : undefined,
                        fontSize: 11,
                        fontWeight: 500,
                        fill: "var(--color-primary)",
                      }}
                    />
                  )}
                  {regionMedianLabel && (
                    <ReferenceLine
                      x={regionMedianLabel}
                      stroke="var(--color-text-secondary)"
                      strokeWidth={1}
                      strokeDasharray="10 3"
                      label={{
                        value: `Region Median ${weeklyToAnnualLabel(campaign?.hh_income_median_region ?? null)}`,
                        position: "top",
                        fontSize: 11,
                        fontWeight: 500,
                        fill: "var(--color-text-secondary)",
                      }}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
