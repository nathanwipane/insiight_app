// ––––––––––– app/(console)/[parent_org_id]/dashboard/campaigns/page.tsx –––––––––––
"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Plus, Search } from "lucide-react";
import { CampaignTypeV2, User } from "@/constants/types";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/constants/config";
import { fetcher } from "@/lib/swrFetchers";
import { formatImpressions, computeCampaignStatus } from "@/lib/campaigns";
import CampaignsTable from "@/components/campaigns/CampaignsTable";
import CampaignsTableSkeleton from "@/components/campaigns/CampaignsTableSkeleton";
import CampaignMetricCard from "@/components/campaigns/CampaignMetricCard";
import GanttTimeline from "@/components/campaigns/GanttTimeline";
import SelectDropdown from "@/components/ui/SelectDropdown";
import ErrorBanner from "@/components/ui/ErrorBanner";
import EmptyState from "@/components/ui/EmptyState";

// ── Constants ─────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "all",       label: "All statuses" },
  { value: "active",    label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "draft",     label: "Draft" },
];

const DATE_RANGE_OPTIONS = [
  { value: "3m",  label: "3M"  },
  { value: "6m",  label: "6M"  },
  { value: "1y",  label: "1Y"  },
  { value: "all", label: "All" },
];

// ── Main ──────────────────────────────────────────────────────────
export default function CampaignsPage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { hasPermission, hasPermissionsLoaded } = usePermissions();

  const parentOrgId = params.parent_org_id as string;
  const jwtToken    = (session?.user as User)?.jwt || "";

  const [editCampaign, setEditCampaign] = useState<CampaignTypeV2 | null>(null);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange]       = useState("all");
  const [ganttRange, setGanttRange]     = useState("1Y");

  // Open modal from ?addCampaign=true
  useEffect(() => {
    if (searchParams.get("addCampaign") === "true" && !isModalOpen) {
      setIsModalOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("addCampaign");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, isModalOpen]);

  // ── Data fetching ─────────────────────────────────────────────
  const shouldFetch = jwtToken && hasPermissionsLoaded && hasPermission(PERMISSIONS.CAMPAIGNS_VIEW);

  const { data: campaignData, error, isLoading, mutate } = useSWR<{ campaigns: CampaignTypeV2[] }>(
    shouldFetch ? ["/v2/get-all-campaigns", jwtToken] : null,
    fetcher,
    {
      refreshInterval:      3600000,
      revalidateOnFocus:    true,
      revalidateOnReconnect: true,
      errorRetryCount:      3,
    }
  );

  // ── Derived data ──────────────────────────────────────────────
  const allCampaigns = useMemo(() => {
    if (!campaignData?.campaigns || !Array.isArray(campaignData.campaigns)) return [];
    return campaignData.campaigns;
  }, [campaignData?.campaigns]);

  // ── Metrics ───────────────────────────────────────────────────
  const totalImpressions = useMemo(() =>
    allCampaigns.reduce((a, c) => a + (c.total_impressions || 0), 0),
    [allCampaigns]
  );

  const activeCnt = useMemo(() =>
    allCampaigns.filter(c => computeCampaignStatus(c) === "active").length,
    [allCampaigns]
  );

  const completedCnt = useMemo(() =>
    allCampaigns.filter(c => computeCampaignStatus(c) === "completed").length,
    [allCampaigns]
  );

  const avgDelivery = useMemo(() => {
    const withTarget = allCampaigns.filter(c => c.impressions_target > 0);
    if (!withTarget.length) return 0;
    return Math.round(
      withTarget.reduce((a, c) => a + Math.min((c.total_impressions / c.impressions_target) * 100, 200), 0)
      / withTarget.length
    );
  }, [allCampaigns]);

  // ── Table filtering ───────────────────────────────────────────
  const filtered = useMemo(() => {
    const now = new Date();
    const cutoffs: Record<string, Date | null> = {
      "3m":  new Date(now.getFullYear(), now.getMonth() - 3,  now.getDate()),
      "6m":  new Date(now.getFullYear(), now.getMonth() - 6,  now.getDate()),
      "1y":  new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
      "all": null,
    };
    const since = cutoffs[dateRange] ?? null;

    return allCampaigns.filter(c => {
      const matchSearch = !search ||
        c.campaign_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.campaign_alias?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || computeCampaignStatus(c) === statusFilter;
      const matchDate   = !since || new Date(c.end_date) >= since;
      return matchSearch && matchStatus && matchDate;
    });
  }, [allCampaigns, search, statusFilter, dateRange]);

  // ── Error state ───────────────────────────────────────────────
  if (error) {
    return <ErrorBanner message={`Error loading campaigns — ${error.message}`} />;
  }

  // ── Loading state ─────────────────────────────────────────────
  if (isLoading || !hasPermissionsLoaded) {
    return <CampaignsTableSkeleton />;
  }

  // ── Empty state ───────────────────────────────────────────────
  if (allCampaigns.length === 0) {
    return (
      <EmptyState
        title="No campaigns yet"
        subtitle="Create your first campaign to get started."
        action={
          hasPermission(PERMISSIONS.CAMPAIGNS_CREATE) ? (
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                height: 32, padding: "0 14px",
                background: "var(--color-text)", color: "var(--color-surface)",
                border: "none", borderRadius: 7,
                fontSize: 12, fontWeight: 500, cursor: "pointer",
              }}
            >
              <Plus size={12} /> Create campaign
            </button>
          ) : undefined
        }
      />
    );
  }

  // ── Main render ───────────────────────────────────────────────
  return (
    <>
      {/* Top card: metrics + gantt */}
      <div style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 10, overflow: "hidden",
      }}>
        {/* Card header */}
        <div style={{
          padding: "12px 20px", borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface-alt)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text)", marginBottom: 3 }}>
              Overview
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text)" }}>
              Campaign activity summary
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {(["1M", "6M", "1Y"] as const).map(val => (
              <button key={val} onClick={() => setGanttRange(val)} style={{
                height: 26, padding: "0 8px",
                fontSize: 11, fontWeight: ganttRange === val ? 600 : 400,
                border: "none", borderRadius: 5,
                background: ganttRange === val ? "var(--color-text)" : "transparent",
                color: ganttRange === val ? "var(--color-surface)" : "var(--color-text-secondary)",
                cursor: "pointer",
              }}>{val}</button>
            ))}
          </div>
        </div>

        {/* Metrics + Gantt */}
        <div style={{ display: "flex", alignItems: "stretch" }}>
          <div style={{ width: 200, flexShrink: 0, padding: "16px 20px 8px", display: "flex", flexDirection: "column", gap: 20 }}>
            <CampaignMetricCard label="Total impressions" value={formatImpressions(totalImpressions)} />
            <CampaignMetricCard label="Active campaigns"  value={String(activeCnt)} sub="currently running" />
            <CampaignMetricCard label="Avg delivery"      value={`${avgDelivery}%`} />
            <CampaignMetricCard label="Completed"         value={String(completedCnt)} sub="this period" noBorder />
          </div>
          <div style={{ flex: 1, minWidth: 0, padding: "16px 24px", display: "flex", flexDirection: "column" }}>
            <GanttTimeline campaigns={allCampaigns} range={ganttRange} />
          </div>
        </div>
      </div>

      {/* Bottom card: toolbar + table */}
      <div style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
      }}>
        {/* Toolbar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "12px 16px", borderBottom: "1px solid var(--color-border)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)", marginRight: 4 }}>All campaigns</div>
          <div style={{ width: 1, height: 16, background: "var(--color-border)" }} />

          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={12} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-secondary)", pointerEvents: "none" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by campaign or client"
              style={{
                height: 30, paddingLeft: 28, paddingRight: 10,
                fontSize: 12, border: "1px solid var(--color-border)",
                borderRadius: 6, background: "var(--color-surface-alt)",
                color: "var(--color-text)", outline: "none", width: 260,
              }}
            />
          </div>

          {/* Status filter */}
          <SelectDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
            width={140}
          />

          {/* Date range + row count */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {DATE_RANGE_OPTIONS.map(({ value: val, label }) => (
                <button key={val} onClick={() => setDateRange(val)} style={{
                  height: 26, padding: "0 8px",
                  fontSize: 11, fontWeight: dateRange === val ? 600 : 400,
                  border: "none", borderRadius: 5,
                  background: dateRange === val ? "var(--color-text)" : "transparent",
                  color: dateRange === val ? "var(--color-surface)" : "var(--color-text-secondary)",
                  cursor: "pointer",
                }}>{label}</button>
              ))}
            </div>
            <div style={{ width: 1, height: 16, background: "var(--color-border)" }} />
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
              {filtered.length} of {allCampaigns.length}
            </div>
          </div>
        </div>

        {/* Table */}
        <CampaignsTable
          allCampaigns={filtered}
          onEdit={campaign => {
            setEditCampaign(campaign);
            setIsModalOpen(true);
          }}
        />
      </div>

      {/* TODO: <AddCampaignModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} editCampaign={editCampaign} setEditCampaign={setEditCampaign} onSuccess={mutate} /> */}
    </>
  );
}
