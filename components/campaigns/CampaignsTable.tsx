// ––––––––––– components/campaigns/CampaignsTable.tsx –––––––––––
"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import { useParams, useRouter } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown, BarChart2, Pencil } from "lucide-react";
import { CampaignTypeV2 } from "@/constants/types";
import CampaignStatusBadge from "@/components/campaigns/CampaignStatusBadge";
import EditCampaignModal from "@/components/campaigns/EditCampaignModal";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/constants/config";
import {
  formatImpressions,
  formatCampaignDate,
  computeCampaignStatus,
  computeCampaignProgress,
} from "@/lib/campaigns";

// ── Column widths — single source of truth ────────────────────────
const COL_WIDTHS: Record<string, string> = {
  campaign_name:       "27%",
  computed_status:     "10%",
  campaign_alias:      "16%",
  progress_percentage: "20%",
  total_impressions:   "11%",
  start_date:          "10%",
  actions:             "6%",
};

// ── Column helper ─────────────────────────────────────────────────
const columnHelper = createColumnHelper<CampaignTypeV2 & { computed_status: string; progress_percentage: number }>();

// ── Props ─────────────────────────────────────────────────────────
interface CampaignsTableProps {
  allCampaigns: CampaignTypeV2[];
  onEdit?: (campaign: CampaignTypeV2) => void;
  disableDimming?: boolean;
  isDraftsTable?: boolean;
}

export default function CampaignsTable({ allCampaigns, onEdit, disableDimming, isDraftsTable }: CampaignsTableProps) {
  const params      = useParams();
  const router      = useRouter();
  const { hasPermission } = usePermissions();
  const parentOrgId = params.parent_org_id as string;

  const [sorting, setSorting]       = useState<SortingState>([]);
  const [modalOpen, setModalOpen]           = useState(false);
  const [modalCampaign, setModalCampaign]   = useState<CampaignTypeV2 | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });

  // Enrich with computed fields
  const data = useMemo(() =>
    allCampaigns.map(c => ({
      ...c,
      computed_status:     computeCampaignStatus(c),
      progress_percentage: computeCampaignProgress(c),
    })),
    [allCampaigns]
  );

  const columns = useMemo(() => [

    // ── Campaign ────────────────────────────────────────────────
    columnHelper.accessor("campaign_name", {
      header: "Campaign",
      cell: ({ getValue, row }) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)" }}>
            {getValue() || `Campaign ${row.original.campaign_id?.slice(-6)}`}
          </span>
          <span style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>
            {row.original.campaign_id}
          </span>
        </div>
      ),
    }),

    // ── Status ──────────────────────────────────────────────────
    columnHelper.accessor("computed_status", {
      header: "Status",
      cell: ({ getValue }) => <CampaignStatusBadge status={getValue()} />,
    }),

    // ── Client ──────────────────────────────────────────────────
    columnHelper.accessor("campaign_alias", {
      header: "Client",
      cell: ({ getValue }) => (
        <span style={{ fontSize: 12, color: "var(--color-text)" }}>
          {getValue() || "—"}
        </span>
      ),
    }),

    // ── Progress ────────────────────────────────────────────────
    columnHelper.accessor("progress_percentage", {
      header: "Progress",
      cell: ({ getValue, row }) => {
        const pct      = getValue();
        const achieved = row.original.total_impressions;
        const target   = row.original.impressions_target || row.original.projected_impressions;
        if (!target) return <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>—</span>;
        const over = (achieved ?? 0) > target;
        return (
          <div style={{ minWidth: 110 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 3 }}>
              <span>{formatImpressions(achieved)} / {formatImpressions(target)}</span>
              <span style={{ fontWeight: 600, color: "var(--color-text)" }}>{pct}%</span>
            </div>
            <div style={{ height: 3, background: "var(--color-border)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "var(--color-primary)", borderRadius: 99 }} />
            </div>
          </div>
        );
      },
    }),

    // ── Impressions ─────────────────────────────────────────────
    columnHelper.accessor("total_impressions", {
      header: "Impressions",
      cell: ({ getValue }) => (
        <span style={{ fontSize: 12, fontWeight: 500, color: getValue() ? "var(--color-text)" : "var(--color-text-secondary)", fontVariantNumeric: "tabular-nums" }}>
          {formatImpressions(getValue())}
        </span>
      ),
    }),

    // ── Period ──────────────────────────────────────────────────
    columnHelper.accessor("start_date", {
      header: "Period",
      cell: ({ getValue, row }) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 12, color: "var(--color-text)" }}>
            {formatCampaignDate(getValue())}
          </span>
          <span style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>
            to {formatCampaignDate(row.original.end_date)}
          </span>
        </div>
      ),
    }),

    // ── Actions ─────────────────────────────────────────────────
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const isInactive = ["scheduled", "draft"].includes(row.original.computed_status);
        const openModal = () => {
          setModalCampaign(row.original);
          setModalOpen(true);
        };
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
            {!isDraftsTable && (
              <button
                title="View campaign"
                disabled={isInactive}
                onMouseEnter={e => {
                  if (!isInactive) {
                    e.currentTarget.style.background = "var(--color-surface-alt)";
                    e.currentTarget.style.borderColor = "var(--color-text-secondary)";
                    e.currentTarget.style.color = "var(--color-text)";
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "var(--color-border)";
                  e.currentTarget.style.color = isInactive
                    ? "var(--color-text-disabled)"
                    : "var(--color-text-secondary)";
                }}
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 28, height: 28,
                  border: "1px solid var(--color-border)", borderRadius: 6,
                  background: "transparent",
                  color: isInactive ? "var(--color-text-disabled)" : "var(--color-text-secondary)",
                  cursor: "default",
                }}
              >
                <BarChart2 size={11} />
              </button>
            )}

            {hasPermission(PERMISSIONS.CAMPAIGNS_EDIT) && (
              <button
                title="Edit campaign"
                onClick={e => {
                  e.stopPropagation();
                  openModal();
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "var(--color-surface-alt)";
                  e.currentTarget.style.borderColor = "var(--color-text-secondary)";
                  e.currentTarget.style.color = "var(--color-text)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "var(--color-border)";
                  e.currentTarget.style.color = "var(--color-text-secondary)";
                }}
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 28, height: 28,
                  border: "1px solid var(--color-border)", borderRadius: 6,
                  background: "transparent",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                }}
              >
                <Pencil size={11} />
              </button>
            )}
          </div>
        );
      },
    }),

  ], [parentOrgId, router, hasPermission, onEdit, isDraftsTable]);

  const table = useReactTable({
    data,
    columns,
    state:                { sorting, pagination },
    onSortingChange:      setSorting,
    onPaginationChange:   setPagination,
    getCoreRowModel:      getCoreRowModel(),
    getSortedRowModel:    getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination:     false,
  });

  const navBtnStyle: React.CSSProperties = {
    width: 26, height: 26,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    border: "1px solid var(--color-border)", borderRadius: 4,
    background: "var(--color-surface-alt)",
    color: "var(--color-text-secondary)",
    fontSize: 13, cursor: "pointer",
  };

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows   = table.getFilteredRowModel().rows.length;
  const totalPages  = table.getPageCount();
  const firstRow    = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow     = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <>
    <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", borderRadius: 10, overflow: "hidden" }}>
      <thead>
        {table.getHeaderGroups().map(hg => (
          <tr key={hg.id} style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface-alt)" }}>
            {hg.headers.map(header => (
              <th
                key={header.id}
                onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                style={{
                  padding: "9px 14px", textAlign: "left",
                  fontSize: 10, fontWeight: 600,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  color: "var(--color-text)",
                  cursor: header.column.getCanSort() ? "pointer" : "default",
                  width: COL_WIDTHS[header.id] ?? "auto",
                }}
              >
                {!header.isPlaceholder && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      header.column.getIsSorted() === "asc"  ? <ArrowUp   size={9} color="var(--color-text-secondary)" /> :
                      header.column.getIsSorted() === "desc" ? <ArrowDown size={9} color="var(--color-text-secondary)" /> :
                      <ArrowUpDown size={9} color="var(--color-border)" />
                    )}
                  </span>
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} style={{ padding: "48px 16px", textAlign: "center", fontSize: 13, color: "var(--color-text-secondary)" }}>
              No campaigns found
            </td>
          </tr>
        ) : table.getRowModel().rows.map((row, i) => {
          const isInactive = !disableDimming && ["scheduled", "draft"].includes(row.original.computed_status);
          const dimStyle: React.CSSProperties = isInactive ? { opacity: 0.4 } : {};
          return (
            <tr
              key={row.id}
              onClick={() => {
                if (isDraftsTable) {
                  setModalCampaign(row.original);
                  setModalOpen(true);
                } else if (!isInactive) {
                  router.push(`/${parentOrgId}/dashboard/campaigns/${row.original.campaign_id}`);
                }
              }}
              style={{
                borderBottom: i < table.getRowModel().rows.length - 1 ? "1px solid var(--color-border-subtle)" : "none",
                cursor: isInactive ? "default" : "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-alt)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  style={{ padding: "13px 14px", ...(cell.column.id === "actions" ? {} : dimStyle) }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>

    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 14px",
      borderTop: "1px solid var(--color-border)",
      fontSize: 12, color: "var(--color-text-secondary)",
    }}>
      {/* Left — results count */}
      <span>
        Showing <strong style={{ color: "var(--color-text)", fontWeight: 500 }}>{firstRow}</strong> to{" "}
        <strong style={{ color: "var(--color-text)", fontWeight: 500 }}>{lastRow}</strong> of{" "}
        <strong style={{ color: "var(--color-text)", fontWeight: 500 }}>{totalRows}</strong> results
      </span>

      {/* Right — page size + navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Page size selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            style={{
              height: 26, padding: "0 6px",
              fontSize: 12, border: "1px solid var(--color-border)",
              borderRadius: 4, background: "var(--color-surface-alt)",
              color: "var(--color-text)", cursor: "pointer", outline: "none",
            }}
          >
            {[20, 50, 100].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        {/* Page navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}
            style={{ ...navBtnStyle, opacity: !table.getCanPreviousPage() ? 0.3 : 1 }}>«</button>
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
            style={{ ...navBtnStyle, opacity: !table.getCanPreviousPage() ? 0.3 : 1 }}>‹</button>
          <span style={{ padding: "0 8px", fontSize: 12, color: "var(--color-text-secondary)" }}>
            Page <strong style={{ color: "var(--color-text)", fontWeight: 500 }}>{pageIndex + 1}</strong> of{" "}
            <strong style={{ color: "var(--color-text)", fontWeight: 500 }}>{totalPages}</strong>
          </span>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
            style={{ ...navBtnStyle, opacity: !table.getCanNextPage() ? 0.3 : 1 }}>›</button>
          <button onClick={() => table.lastPage()} disabled={!table.getCanNextPage()}
            style={{ ...navBtnStyle, opacity: !table.getCanNextPage() ? 0.3 : 1 }}>»</button>
        </div>
      </div>
    </div>
    <EditCampaignModal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      campaignId={modalCampaign?.campaign_id}
      campaignName={modalCampaign?.campaign_name}
    />
    </>
  );
}