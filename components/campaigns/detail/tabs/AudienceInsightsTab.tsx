"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { User } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";
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
export default function AudienceInsightsTab() {
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

  const overIndexedItems: RankedBarItem[] = useMemo(() => {
    if (!demographicsData) return [];
    return demographicsData
      .flatMap(s => s.data.map(d => ({ ...d, segment_type: s.segment_type })))
      .filter(d => d.index > 110)
      .sort((a, b) => b.index - a.index)
      .slice(0, 8)
      .map(d => ({
        label: d.label,
        value: d.index - 100,
        displayValue: d.index.toFixed(0),
        rightTag: `+${(d.index - 100).toFixed(0)}`,
      }));
  }, [demographicsData]);

  const ageChartData = useMemo(() => {
    return findSegment(demographicsData, 'age').map(d => ({
      group: d.label,
      v: parseFloat((d.proportion * 100).toFixed(1)),
    }));
  }, [demographicsData]);

  const occupationItems: RankedBarItem[] = useMemo(() => {
    return findSegment(demographicsData, 'occupation')
      .sort((a, b) => b.proportion - a.proportion)
      .map(d => ({
        label: d.label,
        value: d.proportion,
        displayValue: `${(d.proportion * 100).toFixed(1)}%`,
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
      v: parseFloat((d.proportion * 100).toFixed(1)),
    }));
  }, [demographicsData]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Row 1: Gender + Over-indexed */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        <SectionCard
          title="Gender Distribution"
          subtitle="Audience split by gender"
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
                    tickFormatter={(v: number) => `${v}%`} />
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
        >
          {loading ? (
            <div style={{ height: 200, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
          ) : (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hhIncomeData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }} barCategoryGap="20%">
                  <CartesianGrid {...GRID_STYLE} />
                  <XAxis dataKey="range" tick={{ ...TICK_STYLE, fontSize: 9 }} tickLine={false} axisLine={false} />
                  <YAxis tick={TICK_STYLE} tickLine={false} axisLine={false}
                    tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip {...TOOLTIP_STYLE} />
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
