"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { BarChart2, Download, FileText } from "lucide-react";
import { User } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

type AIInsightsV2 = {
  pcr: {
    id: number;
    campaign_id: string;
    report_type: string;
    week_end_date: string;
    executive_summary: string;
    target_summary: string;
    strategic_insight: string;
    targeted_segments: any[];
    top_personas: any[];
    recommendations: string;
    created_at: string;
    last_updated: string;
  } | null;
  weekly: {
    id: number;
    campaign_id: string;
    report_type: string;
    week_end_date: string;
    executive_summary: string;
    target_summary: string;
    created_at: string;
  }[];
};

export default function ReportsTab() {
  const params     = useParams();
  const campaignId = params.campaign_id as string;
  const { data: session } = useSession();
  const token      = (session?.user as User)?.jwt ?? "";

  const [pcrModal, setPcrModal] = useState<'presentation' | 'newsletter' | null>(null);
  const [weeklyViewId, setWeeklyViewId] = useState<number | null>(null);

  const { data: insightsData, isLoading } = useSWR<AIInsightsV2>(
    !!token && !!campaignId
      ? [`/v2/campaign/${campaignId}/insights`, token]
      : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, errorRetryCount: 3 }
  );

  const pcr     = insightsData?.pcr ?? null;
  const nl      = insightsData?.weekly ?? [];
  const loading = isLoading;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── PCR Report ── */}
      <div style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 10, overflow: "hidden",
      }}>
        <div style={{
          padding: "10px 20px",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface-alt)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-secondary)" }}>
            Campaign Performance Report
          </div>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            height: 28, padding: "0 10px",
            fontSize: 11, color: "var(--color-text-secondary)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 6, cursor: "pointer",
          }}>
            <Download size={10} /> Download All
          </button>
        </div>

        <div style={{ padding: 20 }}>
          {loading ? (
            <Skeleton height={80} borderRadius={8} />
          ) : pcr ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: 16, border: "1px solid var(--color-border)",
              borderRadius: 10,
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-alt)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: "var(--color-surface-alt)",
                border: "1px solid var(--color-border)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <BarChart2 size={16} style={{ color: "var(--color-text-secondary)" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)", marginBottom: 3 }}>
                  Post-Campaign Report
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                  Week ending {new Date(pcr.week_end_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "2-digit" })}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>
                  Generated {new Date(pcr.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "2-digit" })}
                </span>
                <Button variant="primary" size="sm" onClick={() => setPcrModal('presentation')}>
                  View Presentation
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setPcrModal('newsletter')}>
                  View Newsletter
                </Button>
                <Button variant="secondary" size="sm">
                  <Download size={10} /> PDF
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState title="No report available yet." />
          )}
        </div>
      </div>

      {/* ── Weekly newsletters ── */}
      <div style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 10, overflow: "hidden",
      }}>
        <div style={{
          padding: "10px 20px",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface-alt)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-secondary)" }}>
              Weekly Reports
            </div>
            {!loading && (
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
                {nl.length} report{nl.length !== 1 ? "s" : ""} available
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={64} borderRadius={8} />
            ))
          ) : nl.length === 0 ? (
            <EmptyState title="No weekly reports yet." />
          ) : (
            nl.map((report) => {
              const summary = report.executive_summary ?? "";
              const summaryShort = summary.length > 100 ? summary.slice(0, 100) + "…" : summary;
              return (
                <div
                  key={report.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: 14, border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-alt)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 6,
                    background: "var(--color-surface-alt)",
                    border: "1px solid var(--color-border)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <FileText size={14} style={{ color: "var(--color-text-secondary)" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text)", marginBottom: 3 }}>
                      Week ending {new Date(report.week_end_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                      {summaryShort}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, maxWidth: 240, display: "none" }} />
                  <button
                    onClick={() => setWeeklyViewId(report.id)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      height: 28, padding: "0 10px", flexShrink: 0,
                      fontSize: 11, color: "var(--color-text-secondary)",
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 6, cursor: "pointer",
                    }}
                  >
                    <Download size={10} /> View
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal
        open={pcrModal === 'presentation' && !!pcr}
        onClose={() => setPcrModal(null)}
        title="PCR Presentation — coming soon"
        maxWidth={800}
      >
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          Content coming soon.
        </div>
      </Modal>

      <Modal
        open={pcrModal === 'newsletter' && !!pcr}
        onClose={() => setPcrModal(null)}
        title="PCR Newsletter — coming soon"
        maxWidth={800}
      >
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          Content coming soon.
        </div>
      </Modal>

      <Modal
        open={weeklyViewId !== null}
        onClose={() => setWeeklyViewId(null)}
        title="Weekly Report — coming soon"
        maxWidth={600}
      >
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          Content coming soon.
        </div>
      </Modal>
    </div>
  );
}
