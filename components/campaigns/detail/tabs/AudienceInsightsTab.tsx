"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend, ReferenceLine
} from "recharts";
import { Eye, EyeOff, Settings2, ChevronDown } from "lucide-react";
import { User } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";
import SectionCard from "@/components/campaigns/detail/SectionCard";
import RankedBarList, { RankedBarItem } from "@/components/campaigns/detail/RankedBarList";
import IndexChart from "@/components/campaigns/detail/IndexChart";
import ChartTooltip from "@/components/campaigns/detail/ChartTooltip";
import { useCampaignViewPreferences } from "@/hooks/useCampaignViewPreferences";
import { toast } from "sonner";

const SEGMENT_LABELS: Record<string, string> = {
  age: "Age", education: "Education", gender: "Gender",
  hh_income: "Household Income", income: "Personal Income",
  industry: "Industry", occupation: "Occupation",
  property: "Property", tenure: "Tenure",
};

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

function EditToggleRow({
  label,
  value,
  isHidden,
  onToggle,
  meta,
}: {
  label: string;
  value?: string;
  isHidden: boolean;
  onToggle: () => void;
  meta?: string;
}) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 4px",
        cursor: "pointer",
        borderRadius: 6,
        transition: "background 0.1s",
      }}
      onMouseEnter={e =>
        (e.currentTarget.style.background = "var(--color-surface-alt)")
      }
      onMouseLeave={e =>
        (e.currentTarget.style.background = "transparent")
      }
    >
      {/* Checkbox */}
      <div style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        border: `1.5px solid ${!isHidden ? "var(--color-text)" : "var(--color-border)"}`,
        background: !isHidden ? "var(--color-text)" : "transparent",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
      }}>
        {!isHidden && (
          <svg width="9" height="9" viewBox="0 0 9 9">
            <path
              d="M1.5 4.5l2 2 4-4"
              stroke="var(--color-surface)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        )}
      </div>

      {/* Label */}
      <span style={{
        flex: 1,
        fontSize: 12,
        color: isHidden
          ? "var(--color-text-muted)"
          : "var(--color-text-secondary)",
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}>
        {label}
      </span>

      {/* Value/meta */}
      {(value ?? meta) && (
        <span style={{
          fontSize: 11,
          color: "var(--color-text-secondary)",
          flexShrink: 0,
        }}>
          {value ?? meta}
        </span>
      )}
    </div>
  );
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

  const { preferences, updatePreference } = useCampaignViewPreferences(campaignId);
  const [editingOccupation, setEditingOccupation] = useState(false);
  const [editingOverIndexed, setEditingOverIndexed] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  // ── Derived data ────────────────────────────────────────────────
  const genderSegment = findSegment(demographicsData, 'gender');
  const genderItems: RankedBarItem[] = useMemo(() => {
    return genderSegment.map(g => ({
      label: g.label,
      value: g.proportion,
      displayValue: `${(g.proportion * 100).toFixed(1)}%`,
    })).sort((a, b) => b.value - a.value);
  }, [genderSegment]);

  const allOverIndexedItems = useMemo(() => {
    if (!demographicsData) return [];
    return demographicsData
      .flatMap(s => s.data.map(d => ({
        label: d.label,
        index: d.index,
        segment_type: s.segment_type,
      })))
      .sort((a, b) => b.index - a.index);
  }, [demographicsData]);

  const overIndexedItems = useMemo(() => {
    if (editingOverIndexed) return allOverIndexedItems.map(d => ({
      label: d.label, index: d.index,
    }));
    const visible = preferences.over_indexed;
    if (visible === undefined) {
      return allOverIndexedItems
        .filter(d => d.index > 110)
        .slice(0, 5)
        .map(d => ({ label: d.label, index: d.index }));
    }
    return allOverIndexedItems
      .filter(d => visible.includes(d.label))
      .map(d => ({ label: d.label, index: d.index }));
  }, [allOverIndexedItems, preferences.over_indexed, editingOverIndexed]);

  useEffect(() => {
    if (editingOverIndexed && !selectedSegment) {
      const firstSegment = allOverIndexedItems[0]?.segment_type ?? null;
      setSelectedSegment(firstSegment);
    }
    if (!editingOverIndexed) setSelectedSegment(null);
  }, [editingOverIndexed, allOverIndexedItems]);

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

  const allOccupationItems: RankedBarItem[] = useMemo(() => {
    return findSegment(demographicsData, 'occupation')
      .sort((a, b) => b.proportion - a.proportion)
      .map(d => ({
        label: d.label,
        value: d.proportion,
        displayValue: Math.round(d.proportion * impressions).toLocaleString(),
      }));
  }, [demographicsData, impressions]);

  const occupationItems = useMemo(() => {
    if (editingOccupation) return allOccupationItems;
    const visible = preferences.occupation;
    if (visible === undefined) {
      return allOccupationItems.slice(0, 6);
    }
    return allOccupationItems.filter(o => visible.includes(o.label));
  }, [allOccupationItems, preferences.occupation, editingOccupation]);

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
          action={
            <button
              onClick={() => setEditingOverIndexed(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 11, fontWeight: 500,
                color: editingOverIndexed ? "var(--color-text)" : "var(--color-text-muted)",
                background: editingOverIndexed ? "var(--color-surface-alt)" : "transparent",
                border: "1px solid var(--color-border)",
                borderRadius: 6, padding: "3px 8px",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <Settings2 size={11} />
              {editingOverIndexed ? "Done" : "Manage"}
            </button>
          }
        >
          {loading ? <SkeletonRows count={5} /> : editingOverIndexed ? (
            (() => {
              const defaultVisible = allOverIndexedItems
                .filter(d => d.index > 110)
                .slice(0, 5)
                .map(d => d.label);
              const visible = preferences.over_indexed ?? defaultVisible;
              const grouped = allOverIndexedItems.reduce((acc, item) => {
                if (!acc[item.segment_type]) acc[item.segment_type] = [];
                acc[item.segment_type].push(item);
                return acc;
              }, {} as Record<string, typeof allOverIndexedItems>);

              const selectedItems = selectedSegment
                ? (grouped[selectedSegment] ?? [])
                : [];

              return (
                <div style={{
                  display: "flex",
                  gap: 0,
                  height: 320,
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}>
                  {/* Left — category list */}
                  <div style={{
                    width: 200,
                    flexShrink: 0,
                    borderRight: "1px solid var(--color-border)",
                    overflowY: "auto",
                    background: "var(--color-surface-alt)",
                  }}>
                    {Object.entries(grouped).map(([segType, items]) => {
                      const visibleCount = items.filter(i => visible.includes(i.label)).length;
                      const isSelected = selectedSegment === segType;
                      return (
                        <div
                          key={segType}
                          onClick={() => setSelectedSegment(segType)}
                          style={{
                            padding: "9px 12px",
                            cursor: "pointer",
                            background: isSelected
                              ? "var(--color-surface)"
                              : "transparent",
                            borderLeft: isSelected
                              ? "2px solid var(--color-text)"
                              : "2px solid transparent",
                            transition: "all 0.1s",
                          }}
                        >
                          <div style={{
                            fontSize: 12,
                            fontWeight: isSelected ? 600 : 400,
                            color: isSelected
                              ? "var(--color-text)"
                              : "var(--color-text-secondary)",
                            marginBottom: 2,
                          }}>
                            {SEGMENT_LABELS[segType] ?? segType}
                          </div>
                          <div style={{
                            fontSize: 10,
                            color: "var(--color-text-muted)",
                          }}>
                            {visibleCount}/{items.length} visible
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right — items for selected category */}
                  <div style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "4px 8px",
                  }}>
                    {selectedItems.length === 0 ? (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        fontSize: 12,
                        color: "var(--color-text-muted)",
                      }}>
                        Select a category
                      </div>
                    ) : (
                      selectedItems.map((item, i) => {
                        const isCurrentlyVisible = visible.includes(item.label);
                        const isHiddenForDisplay = !isCurrentlyVisible;
                        return (
                          <EditToggleRow
                            key={i}
                            label={item.label}
                            value={String(Math.round(item.index))}
                            isHidden={isHiddenForDisplay}
                            onToggle={async () => {
                              const current = preferences.over_indexed ?? defaultVisible;
                              const isVis = current.includes(item.label);
                              if (isVis) {
                                await updatePreference("over_indexed",
                                  current.filter(k => k !== item.label));
                              } else {
                                if (current.length >= 5) {
                                  toast("Maximum 5 audiences — hide one first to add another");
                                  return;
                                }
                                await updatePreference("over_indexed", [...current, item.label]);
                              }
                            }}
                          />
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
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

        <SectionCard
          title="Audience by Occupation"
          subtitle="Understand the background of your impressions"
          action={
            <button
              onClick={() => setEditingOccupation(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 11, fontWeight: 500,
                color: editingOccupation ? "var(--color-text)" : "var(--color-text-muted)",
                background: editingOccupation ? "var(--color-surface-alt)" : "transparent",
                border: "1px solid var(--color-border)",
                borderRadius: 6, padding: "3px 8px",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <Settings2 size={11} />
              {editingOccupation ? "Done" : "Manage"}
            </button>
          }
        >
          {loading ? <SkeletonRows count={7} /> : editingOccupation ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {allOccupationItems.map((o, i) => {
                const visible = preferences.occupation ??
                  allOccupationItems.slice(0, 6).map(x => x.label);
                const isCurrentlyVisible = visible.includes(o.label);
                const isHiddenForDisplay = !isCurrentlyVisible;
                return (
                  <EditToggleRow
                    key={i}
                    label={o.label}
                    value={o.displayValue}
                    isHidden={isHiddenForDisplay}
                    onToggle={async () => {
                      const current = preferences.occupation ??
                        allOccupationItems.slice(0, 6).map(x => x.label);
                      const isVis = current.includes(o.label);
                      if (isVis) {
                        await updatePreference("occupation",
                          current.filter(k => k !== o.label));
                      } else {
                        if (current.length >= 6) {
                          toast("Maximum 6 occupations — hide one first to add another");
                          return;
                        }
                        await updatePreference("occupation", [...current, o.label]);
                      }
                    }}
                  />
                );
              })}
            </div>
          ) : (
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
