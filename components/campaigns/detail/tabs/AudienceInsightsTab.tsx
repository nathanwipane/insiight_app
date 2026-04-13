"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { User, DemographicsResponse, IncomeApiData } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";
import { useIsTestOrg } from "@/hooks/useIsTestOrg";
import SectionCard from "@/components/campaigns/detail/SectionCard";
import RankedBarList, { RankedBarItem } from "@/components/campaigns/detail/RankedBarList";

// ── Chart style constants ─────────────────────────────────────────
const GRID_STYLE    = { strokeDasharray: "3 3" as const, stroke: "var(--color-border-subtle)", vertical: false as const };
const TICK_STYLE    = { fontSize: 10, fill: "var(--color-text-muted)" };
const TOOLTIP_STYLE = {
  contentStyle: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: 8, fontSize: 11, padding: "6px 10px",
  },
};

// ── Sample data ───────────────────────────────────────────────────
const SAMPLE_DEMOGRAPHICS: DemographicsResponse = {
  data: {
    totals: {
      total_males:   228942,
      total_females: 228943,
      total_reach:   457885,
      age_distribution: {
        "20–34": 126523, "35–49": 132739, "50–64": 111346, "65–80": 67996, "80+": 10231,
      },
      education_distribution: {
        "University Education": 39.6, "Professional/Trades": 37.6, "Secondary Education": 22.8,
      },
      occupation_distribution: {
        "Technicians & Trades": 66425, "Clerical & Admin": 58007, "Managers": 56558,
        "Community & Personal Svc": 54272, "Labourers": 38425, "Sales Workers": 36374,
        "Machinery Operators": 31555,
      },
      median_age: 42,
      median_weekly_household_income: 2115,
      average_income_personal: 1480,
      average_income_family: 2960,
      last_updated: "2026-03-09",
    },
    indexed: {
      "1 bedroom_Index": "121",
      "High Household Income_Index": "113",
      "45–49 years_Index": "106",
      "University Education_Index": "106",
      "Male_Index": "101",
    },
  },
};

const SAMPLE_INCOME: IncomeApiData[] = [
  { income_range: "$0–52K",     total_reach: 1800  },
  { income_range: "$52–104K",   total_reach: 64200 },
  { income_range: "$104–156K",  total_reach: 64800 },
  { income_range: "$156–208K",  total_reach: 9400  },
  { income_range: "$208–260K+", total_reach: 3200  },
];

// ── Helpers ───────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${Math.round(n / 1_000)}K`;
  return n.toLocaleString();
}

function recordToRankedItems(
  data: Record<string, number>,
  formatValue: (v: number) => string = fmt
): RankedBarItem[] {
  return Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .map(([label, value]) => ({ label, value, displayValue: formatValue(value) }));
}

function indexedToRankedItems(indexed: Record<string, string | null>): RankedBarItem[] {
  return Object.entries(indexed)
    .filter(([, v]) => v !== null)
    .map(([key, v]) => {
      const score = parseFloat(v ?? "0");
      const label = key.replace(/_Index$/, "").replace(/_/g, " ");
      return {
        label,
        value: Math.max(score - 100, 0),
        displayValue: String(Math.round(score)),
        rightTag: `+${Math.round(score - 100)}%`,
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
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
export default function AudienceInsightsTab() {
  const params     = useParams();
  const campaignId = params.campaign_id as string;
  const { data: session } = useSession();
  const token      = (session?.user as User)?.jwt ?? "";
  const isTestOrg  = useIsTestOrg();

  const shouldFetch = !isTestOrg && !!token && !!campaignId;

  const { data: demoResp, isLoading: demoLoading } = useSWR<DemographicsResponse>(
    shouldFetch
      ? [`/get-demographics-data/${campaignId}?is_asset=false&include_plan_restriction=true`, token]
      : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, errorRetryCount: 3 }
  );

  const { data: incomeResp, isLoading: incomeLoading } = useSWR<IncomeApiData[]>(
    shouldFetch
      ? [`/get-household-income-graph/${campaignId}?is_asset=false`, token]
      : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, errorRetryCount: 3 }
  );

  const demo   = isTestOrg ? SAMPLE_DEMOGRAPHICS : demoResp;
  const income = isTestOrg ? SAMPLE_INCOME       : incomeResp;
  const loading = !isTestOrg && (demoLoading || incomeLoading);

  // ── Derived data ────────────────────────────────────────────────
  const totalReach = demo?.data.totals.total_reach ?? 0;

  const genderItems: RankedBarItem[] = useMemo(() => {
    if (!demo) return [];
    const { total_males, total_females, total_reach } = demo.data.totals;
    const totalG = total_males + total_females || total_reach;
    return [
      { label: "Female", value: total_females, displayValue: `${Math.round((total_females / totalG) * 100)}%`, sublabel: total_females.toLocaleString() },
      { label: "Male",   value: total_males,   displayValue: `${Math.round((total_males   / totalG) * 100)}%`, sublabel: total_males.toLocaleString() },
    ];
  }, [demo]);

  const overIndexedItems = useMemo(() =>
    demo ? indexedToRankedItems(demo.data.indexed) : [],
    [demo]
  );

  const ageChartData = useMemo(() => {
    if (!demo?.data.totals.age_distribution) return [];
    return Object.entries(demo.data.totals.age_distribution).map(([group, v]) => ({ group, v }));
  }, [demo]);

  const occupationItems = useMemo(() =>
    demo ? recordToRankedItems(demo.data.totals.occupation_distribution) : [],
    [demo]
  );

  const educationItems: RankedBarItem[] = useMemo(() => {
    if (!demo) return [];
    return Object.entries(demo.data.totals.education_distribution)
      .sort(([, a], [, b]) => b - a)
      .map(([label, value]) => ({ label, value, displayValue: `${value}%`, suffix: "" }));
  }, [demo]);

  const incomeChartData = useMemo(() =>
    (income ?? []).map(d => ({ range: d.income_range, v: d.total_reach })),
    [income]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Row 1: Gender + Over-indexed */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        <SectionCard
          title="Gender Distribution"
          subtitle={`Total audience reach · ${fmt(totalReach)}`}
        >
          {loading ? <SkeletonRows count={2} /> : (
            <RankedBarList
              items={genderItems}
              showRank={false}
              graduated={false}
            />
          )}
        </SectionCard>

        <SectionCard
          title="Over-Indexed Audiences"
          subtitle="Segments performing above city average (100)"
        >
          {loading ? <SkeletonRows count={5} /> : (
            <RankedBarList
              items={overIndexedItems}
              maxValue={25}
              graduated
            />
          )}
        </SectionCard>
      </div>

      {/* Row 2: Age (bar chart) + Occupation (ranked list) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        <SectionCard title="Age Distribution" subtitle="Campaign impressions by audience age groups">
          {loading ? (
            <div style={{ height: 200, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
          ) : (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="group" tick={TICK_STYLE} tickLine={false} axisLine={false} />
                  <YAxis tick={TICK_STYLE} tickLine={false} axisLine={false}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="v" fill="var(--color-text)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Audience by Occupation" subtitle="Understand the background of your reach">
          {loading ? <SkeletonRows count={7} /> : (
            <RankedBarList items={occupationItems} />
          )}
        </SectionCard>
      </div>

      {/* Row 3: Education (ranked list) + Income (bar chart) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        <SectionCard title="Education Level Distribution" subtitle="Highest levels of education in your audience">
          {loading ? <SkeletonRows count={3} /> : (
            <RankedBarList items={educationItems} graduated />
          )}
        </SectionCard>

        <SectionCard
          title="Household Income Distribution"
          subtitle="Annual household income ranges in your audience"
          action={
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 10, color: "var(--color-text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ display: "inline-block", width: 12, borderTop: "1.5px dashed var(--color-text-muted)" }} />
                City avg
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ display: "inline-block", width: 12, borderTop: "1.5px dashed var(--color-text)" }} />
                Audience avg
              </span>
            </div>
          }
        >
          {loading ? (
            <div style={{ height: 200, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
          ) : (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeChartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }} barCategoryGap="20%">
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="range" tick={{ ...TICK_STYLE, fontSize: 9 }} tickLine={false} axisLine={false} />
                  <YAxis tick={TICK_STYLE} tickLine={false} axisLine={false}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <ReferenceLine x="$52–104K"  stroke="var(--color-text-muted)" strokeDasharray="4 2" strokeWidth={1.5} />
                  <ReferenceLine x="$104–156K" stroke="var(--color-text)"       strokeDasharray="4 2" strokeWidth={1.5} />
                  <Bar dataKey="v" fill="var(--color-text)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}