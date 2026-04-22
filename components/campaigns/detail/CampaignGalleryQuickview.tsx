"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Image as ImageIcon, ArrowRight } from "lucide-react";
import { User } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";

type PopV2 = {
  id: number;
  campaign_id: string;
  asset_id: string | null;
  url: string;
  title: string;
  description: string | null;
  location: string | null;
  captured_at: string | null;
  time_uploaded: string;
};

interface CampaignGalleryQuickviewProps {
  onViewAll: () => void; // navigates to pops tab
}

export default function CampaignGalleryQuickview({ onViewAll }: CampaignGalleryQuickviewProps) {
  const params     = useParams();
  const campaignId = params.campaign_id as string;
  const { data: session } = useSession();
  const token      = (session?.user as User)?.jwt ?? "";

  const shouldFetch = !!token && !!campaignId;

  const { data: pops, isLoading } = useSWR<PopV2[]>(
    shouldFetch ? [`/v2/campaign/${campaignId}/pops?limit=1`, token] : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, errorRetryCount: 3 }
  );

  const latest  = pops?.[0];
  const loading = isLoading;
  const caption = latest?.location ?? latest?.description;

  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 10, overflow: "hidden",
      display: "flex", flexDirection: "column",
      height: "100%",
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 20px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface-alt)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text)" }}>
            Proof Of Play
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
            Latest campaign image
          </div>
        </div>
        <button
          onClick={onViewAll}
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 11, color: "var(--color-text-secondary)",
            background: "none", border: "none", cursor: "pointer", padding: 0,
          }}
        >
          View all <ArrowRight size={11} />
        </button>
      </div>

      {/* Image area */}
      <div style={{ flex: 1, position: "relative", minHeight: 220 }}>
        {loading ? (
          <div style={{ height: "100%", minHeight: 220, background: "var(--color-border)", animation: "pulse 1.5s ease-in-out infinite" }} />
        ) : latest?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={latest.url}
            alt={latest.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{
            height: "100%", minHeight: 220,
            background: "#1a1f2e",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 10,
          }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #1f2937, #111827)", opacity: 0.9 }} />
            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <ImageIcon size={28} style={{ color: "#4b5563" }} />
              <span style={{ fontSize: 11, color: "#6b7280" }}>No images yet</span>
            </div>
          </div>
        )}

        {/* Overlay caption */}
        {latest && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
            padding: "24px 16px 12px",
          }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#fff" }}>{latest.title}</div>
            {caption && (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{caption}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
