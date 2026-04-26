"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Filter, Settings2 } from "lucide-react";
import { User } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";
import apiClient from "@/lib/config";
import SectionCard from "@/components/campaigns/detail/SectionCard";
import RankedBarList from "@/components/campaigns/detail/RankedBarList";
import HexMap from "@/components/reports/PCRPresentation/HexMap";
import RouteMap from "@/components/campaigns/detail/RouteMap";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import { useCampaignViewPreferences } from "@/hooks/useCampaignViewPreferences";
import { toast } from "sonner";

type HourlyRow = { hour: number; impressions: number; ad_plays: number };
type HeatmapRow = { h3_cell: string; total_impressions: number; total_ad_plays: number };

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

// ── Main component ────────────────────────────────────────────────
export default function CampaignPerformanceTab() {
  const params      = useParams();
  const campaignId  = params.campaign_id as string;
  const { data: session } = useSession();
  const token       = (session?.user as User)?.jwt ?? "";

  const shouldFetch = !!token && !!campaignId;

  const [mapView, setMapView] = useState<"heatmap" | "route">("heatmap");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const { preferences, updatePreference } = useCampaignViewPreferences(campaignId);
  const [editingSuburbs, setEditingSuburbs] = useState(false);

  const { data: suburbsData, isLoading: suburbLoading } = useSWR<{ suburb: string; state: string; total_impressions: number }[]>(
    shouldFetch ? [`/v2/campaign/${campaignId}/suburbs`, token] : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, errorRetryCount: 3 }
  );

  const { data: hourlyData, isLoading: hourLoading } = useSWR<HourlyRow[]>(
    shouldFetch ? [`/v2/campaign/${campaignId}/hourly`, token] : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, errorRetryCount: 3 }
  );

  const { data: heatmapData = [] } = useSWR<HeatmapRow[]>(
    shouldFetch ? [`/v2/campaign/${campaignId}/heatmap`, token] : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: false }
  );

  const pathFetcher = async ([url, jwt]: [string, string]) => {
    const res = await apiClient.get(url, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return res.data;
  };

  const { data: pathResponse } = useSWR<{
    status: boolean;
    data: any[];
    meta: {
      resolved_date: string;
      available_dates: string[];
      available_assets: string[];
    };
  }>(
    shouldFetch ? [`/v2/campaign/${campaignId}/path`, token] : null,
    pathFetcher,
    { refreshInterval: 0, revalidateOnFocus: false }
  );
  const pathData = pathResponse?.data ?? [];
  const pathMeta = pathResponse?.meta ?? { resolved_date: "", available_dates: [], available_assets: [] };

  const availableDates = useMemo(
    () => (pathMeta.available_dates ?? []).map((d: string) => d.split("T")[0]),
    [pathMeta.available_dates]
  );
  const availableAssets = pathMeta.available_assets ?? [];

  const selectedDates = selectedFilters.filter(v => availableDates.includes(v));
  const selectedAssets = selectedFilters.filter(v => availableAssets.includes(v));

  // Pairing map: which dates exist for each asset, and which assets exist for each date
  const pairingMap = useMemo(() => {
    const assetToDates: Record<string, Set<string>> = {};
    const dateToAssets: Record<string, Set<string>> = {};
    pathData.forEach((asset: any) => {
      const date = asset.play_date?.split("T")[0];
      const id = asset.asset_id;
      if (!date || !id) return;
      if (!assetToDates[id]) assetToDates[id] = new Set();
      if (!dateToAssets[date]) dateToAssets[date] = new Set();
      assetToDates[id].add(date);
      dateToAssets[date].add(id);
    });
    return { assetToDates, dateToAssets };
  }, [pathData]);

  // Valid options based on current selections
  const validDates = useMemo(() => {
    if (selectedAssets.length === 0) return new Set(availableDates);
    const valid = new Set<string>();
    selectedAssets.forEach(id => {
      pairingMap.assetToDates[id]?.forEach(d => valid.add(d));
    });
    return valid;
  }, [selectedAssets, availableDates, pairingMap]);

  const validAssets = useMemo(() => {
    if (selectedDates.length === 0) return new Set(availableAssets);
    const valid = new Set<string>();
    selectedDates.forEach(d => {
      pairingMap.dateToAssets[d]?.forEach(id => valid.add(id));
    });
    return valid;
  }, [selectedDates, availableAssets, pairingMap]);

  // Initialise selection to all available dates + assets on first load
  useEffect(() => {
    if (selectedFilters.length === 0 && (availableDates.length > 0 || availableAssets.length > 0)) {
      setSelectedFilters([...availableDates, ...availableAssets]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableDates.length, availableAssets.length]);

  const filteredPathData = pathData.filter((asset: any) => {
    const assetDate = asset.play_date?.split("T")[0];
    const dateMatch = selectedDates.length === 0 ||
      selectedDates.includes(assetDate);
    const assetMatch = selectedAssets.length === 0 ||
      selectedAssets.includes(asset.asset_id);
    return dateMatch && assetMatch;
  });

  const filterGroups = [
    {
      label: "Date",
      options: (pathMeta.available_dates ?? []).map((d: string) => {
        const value = d.split("T")[0];
        return {
          value,
          label: new Date(d).toLocaleDateString("en-AU", {
            day: "numeric", month: "short", timeZone: "UTC",
          }),
          disabled: !validDates.has(value),
        };
      }),
    },
    {
      label: "Asset",
      options: availableAssets.map((a: string) => ({
        value: a,
        label: a,
        disabled: !validAssets.has(a),
      })),
    },
  ];

  const hourChartData = useMemo(() => {
    if (!hourlyData) return [];
    // Ensure all 24 hours are represented even if some have 0 impressions
    return Array.from({ length: 24 }, (_, i) => {
      const row = hourlyData.find(r => r.hour === i);
      return { h: String(i), v: row?.impressions ?? 0 };
    });
  }, [hourlyData]);

  const allSuburbItems = useMemo(() => {
    if (!suburbsData) return [];
    return suburbsData.map(s => ({
      label: `${s.suburb}, ${s.state}`,
      value: s.total_impressions,
      displayValue: s.total_impressions.toLocaleString(),
    }));
  }, [suburbsData]);

  const suburbItems = useMemo(() => {
    if (editingSuburbs) return allSuburbItems;
    const visible = preferences.suburbs;
    if (visible === undefined) {
      return allSuburbItems.slice(0, 5);
    }
    return allSuburbItems.filter(s => visible.includes(s.label));
  }, [allSuburbItems, preferences.suburbs, editingSuburbs]);
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
        action={
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: 8,
          }}>
            {/* Left — filters (only in route view) */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {mapView === "route" && (
                <>
                  <Filter size={13} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
                  <MultiSelectDropdown
                    groups={filterGroups}
                    selected={selectedFilters}
                    onChange={setSelectedFilters}
                    placeholder="All dates · All assets"
                    width={220}
                  />
                </>
              )}
            </div>

            {/* Right — toggle (always visible) */}
            <div style={{
              display: "flex",
              background: "var(--color-surface-alt)",
              border: "1px solid var(--color-border)",
              borderRadius: 6,
              overflow: "hidden",
              flexShrink: 0,
            }}>
              {(["heatmap", "route"] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setMapView(view)}
                  style={{
                    padding: "6px 12px",
                    fontSize: 11,
                    fontWeight: 500,
                    border: "none",
                    cursor: "pointer",
                    background: mapView === view
                      ? "var(--color-text)"
                      : "transparent",
                    color: mapView === view
                      ? "var(--color-surface)"
                      : "var(--color-text-secondary)",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  {view === "heatmap" ? "Heatmap" : "Route"}
                </button>
              ))}
            </div>
          </div>
        }
      >
        {mapView === "heatmap" ? (
          <HexMap data={heatmapData} />
        ) : (
          <RouteMap data={filteredPathData} selectedAsset={null} />
        )}
      </SectionCard>

      {/* Right column: Suburbs + TOD stacked */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        <SectionCard
          title="Top Suburbs"
          subtitle="Total audience reach in best performing suburbs"
          bodyStyle={{ height: 320, overflowY: "auto" }}
          action={
            <button
              onClick={() => setEditingSuburbs(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 11, fontWeight: 500,
                color: editingSuburbs ? "var(--color-text)" : "var(--color-text-muted)",
                background: editingSuburbs ? "var(--color-surface-alt)" : "transparent",
                border: "1px solid var(--color-border)",
                borderRadius: 6, padding: "3px 8px",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <Settings2 size={11} />
              {editingSuburbs ? "Done" : "Manage"}
            </button>
          }
        >
          {suburbLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ height: 28, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
              ))}
            </div>
          ) : editingSuburbs ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {allSuburbItems.map((s, i) => {
                const visible = preferences.suburbs ??
                  allSuburbItems.slice(0, 5).map(x => x.label);
                const isCurrentlyVisible = visible.includes(s.label);
                const isHiddenForDisplay = !isCurrentlyVisible;
                return (
                  <EditToggleRow
                    key={i}
                    label={s.label}
                    value={s.displayValue}
                    isHidden={isHiddenForDisplay}
                    onToggle={async () => {
                      const current = preferences.suburbs ??
                        allSuburbItems.slice(0, 5).map(x => x.label);
                      const isVis = current.includes(s.label);
                      if (isVis) {
                        await updatePreference("suburbs",
                          current.filter(k => k !== s.label));
                      } else {
                        if (current.length >= 5) {
                          toast("Maximum 5 suburbs — hide one first to add another");
                          return;
                        }
                        await updatePreference("suburbs", [...current, s.label]);
                      }
                    }}
                  />
                );
              })}
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
          {hourLoading ? (
            <div style={{
              height: 192,
              background: "var(--color-border)",
              borderRadius: 4,
              animation: "pulse 1.5s ease-in-out infinite"
            }} />
          ) : (
            <div style={{ height: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--color-text)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--color-text)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                  <XAxis
                    dataKey="h"
                    tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="var(--color-text)"
                    strokeWidth={1.5}
                    fill="url(#hourGrad)"
                    dot={false}
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
