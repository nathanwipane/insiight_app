"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { BarChart2, Download, FileText } from "lucide-react";
import { User, CampaignPCR, NewsletterReport } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";
import { useIsTestOrg } from "@/hooks/useIsTestOrg";

// ── Sample data ───────────────────────────────────────────────────
const SAMPLE_PCR: CampaignPCR = {
  data: {
    id: 1,
    campaign_id: "cmp-a1b2c3",
    total_impressions: 2871920,
    total_unique_reach: 437961,
    exec_summary: "The campaign delivered strong market impact across all five cities, achieving full impressions target with no shortfall against projections.",
    targeted_segments: [],
    audience_assessment: "High penetration among professionals and high-income earners in affluent suburbs.",
    top_personas: [],
    recommendations: "Consider increasing budget allocation to peak evening hours for future campaigns.",
    created_at: "2026-03-10T09:00:00Z",
    campaign_meta_data: {
      goals: "Brand awareness",
      status: "completed",
      end_date: "2026-03-09",
      model_name: "Insiight v2",
      start_date: "2026-02-02",
      campaign_id: "cmp-a1b2c3",
      client_name: "Tourism Australia",
      description: "",
      campaign_name: "Summer Drive Awareness",
      projected_reach: 420000,
      target_audiences: [],
      projected_impressions: 2800000,
    },
    creative_list: {},
    display_creative: "",
    target_audiences: "",
    asset_list: [],
    price_of_campaign: 85000,
    organisation_name: "Insiight",
  },
  timeseries: [],
};

const SAMPLE_NEWSLETTERS: NewsletterReport[] = [
  { week_end_date: "2026-02-08", total_impressions: 312400, unique_reach: 51200, performance_summary: "Strong start across all markets. Sydney and Brisbane leading delivery." },
  { week_end_date: "2026-02-15", total_impressions: 698200, unique_reach: 108400, performance_summary: "Delivery tracking ahead of pace. Evening peak hours performing above benchmark." },
  { week_end_date: "2026-02-22", total_impressions: 1041600, unique_reach: 168900, performance_summary: "Mid-campaign strong. Audience quality metrics exceeding projections." },
  { week_end_date: "2026-03-01", total_impressions: 1389800, unique_reach: 224300, performance_summary: "On track for full delivery. Creative performance stable across all formats." },
];

// ── Helpers ───────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${Math.round(n / 1_000)}K`;
  return n.toLocaleString();
}

export default function ReportsTab() {
  const params     = useParams();
  const campaignId = params.campaign_id as string;
  const { data: session } = useSession();
  const token      = (session?.user as User)?.jwt ?? "";
  const isTestOrg  = useIsTestOrg();

  const shouldFetch = !isTestOrg && !!token && !!campaignId;

  const { data: pcrData, isLoading: pcrLoading } = useSWR<CampaignPCR>(
    shouldFetch ? [`/get-campaign-pcr-by-campaign-id/${campaignId}`, token] : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, errorRetryCount: 3 }
  );

  const { data: newsletters, isLoading: nlLoading } = useSWR<NewsletterReport[]>(
    shouldFetch ? [`/get-all-campaign-newsletter-reports/${campaignId}`, token] : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, errorRetryCount: 3 }
  );

  const pcr  = isTestOrg ? SAMPLE_PCR         : pcrData;
  const nl   = isTestOrg ? SAMPLE_NEWSLETTERS  : (newsletters ?? []);
  const loading = !isTestOrg && (pcrLoading || nlLoading);

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
            <div style={{ height: 80, background: "var(--color-border)", borderRadius: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
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
                  Full analytics · {new Date(pcr.data.campaign_meta_data.start_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "2-digit" })}
                  {" – "}{new Date(pcr.data.campaign_meta_data.end_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "2-digit" })}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>
                  Generated {new Date(pcr.data.created_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "2-digit" })}
                </span>
                <button style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  height: 28, padding: "0 10px",
                  fontSize: 11, color: "var(--color-text-secondary)",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 6, cursor: "pointer",
                }}>
                  <Download size={10} /> PDF
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: "32px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>No report available yet.</div>
            </div>
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
              <div key={i} style={{ height: 64, background: "var(--color-border)", borderRadius: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
            ))
          ) : nl.length === 0 ? (
            <div style={{ padding: "32px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>No weekly reports yet.</div>
            </div>
          ) : (
            nl.map((report, i) => (
              <div
                key={i}
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
                    {fmt(report.total_impressions)} impressions · {fmt(report.unique_reach)} reach
                  </div>
                </div>
                <div style={{ flexShrink: 0, maxWidth: 240, display: "none" }} />
                <button style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  height: 28, padding: "0 10px", flexShrink: 0,
                  fontSize: 11, color: "var(--color-text-secondary)",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 6, cursor: "pointer",
                }}>
                  <Download size={10} /> View
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}