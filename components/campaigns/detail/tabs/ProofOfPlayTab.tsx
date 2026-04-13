"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Image as ImageIcon, Calendar, MapPin } from "lucide-react";
import { User, ProofOfPlayImage } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";
import { useIsTestOrg } from "@/hooks/useIsTestOrg";

// ── Sample data ───────────────────────────────────────────────────
const SAMPLE_POPS: ProofOfPlayImage[] = [
  { id: 1, campaign_id: "cmp-a1b2c3", asset_id: null, url: "", title: "Day 1 · Morning run", description: "Brisbane CBD · Route A", time_uploaded: "2026-02-02T08:00:00Z" },
  { id: 2, campaign_id: "cmp-a1b2c3", asset_id: null, url: "", title: "Day 2 · Afternoon shift", description: "Sydney Inner West · Route C", time_uploaded: "2026-02-03T14:30:00Z" },
  { id: 3, campaign_id: "cmp-a1b2c3", asset_id: null, url: "", title: "Day 3 · Evening run", description: "Melbourne CBD · Route B", time_uploaded: "2026-02-04T18:00:00Z" },
  { id: 4, campaign_id: "cmp-a1b2c3", asset_id: null, url: "", title: "Day 7 · Peak hour", description: "Perth CBD · Route D", time_uploaded: "2026-02-08T17:00:00Z" },
  { id: 5, campaign_id: "cmp-a1b2c3", asset_id: null, url: "", title: "Day 12 · Weekend", description: "Adelaide · Route A", time_uploaded: "2026-02-13T11:00:00Z" },
  { id: 6, campaign_id: "cmp-a1b2c3", asset_id: null, url: "", title: "Day 20 · Night run", description: "Sydney CBD · Route E", time_uploaded: "2026-02-21T20:00:00Z" },
];

function PopCard({ pop }: { pop: ProofOfPlayImage }) {
  const date = new Date(pop.time_uploaded).toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 10, overflow: "hidden",
    }}>
      {/* Image area */}
      <div style={{
        height: 160, background: "#1a1f2e",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        {pop.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pop.url} alt={pop.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #1f2937, #111827)", opacity: 0.9 }} />
            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <ImageIcon size={24} style={{ color: "#4b5563" }} />
              <span style={{ fontSize: 10, color: "#6b7280" }}>Proof image</span>
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "10px 14px" }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text)", marginBottom: 4 }}>
          {pop.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 3 }}>
          <MapPin size={9} />
          {pop.description}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--color-text-muted)" }}>
          <Calendar size={9} />
          {date}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ height: 160, background: "var(--color-border)", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 11, width: "70%", background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: 9,  width: "50%", background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

export default function ProofOfPlayTab() {
  const params     = useParams();
  const campaignId = params.campaign_id as string;
  const { data: session } = useSession();
  const token      = (session?.user as User)?.jwt ?? "";
  const isTestOrg  = useIsTestOrg();

  const shouldFetch = !isTestOrg && !!token && !!campaignId;

  const { data: pops, isLoading } = useSWR<ProofOfPlayImage[]>(
    shouldFetch ? [`/get-campaign-pops/${campaignId}`, token] : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: true, errorRetryCount: 3 }
  );

  const images  = isTestOrg ? SAMPLE_POPS : (pops ?? []);
  const loading = !isTestOrg && isLoading;

  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 10, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 20px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface-alt)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-secondary)" }}>
            Proof Of Play · Visual Record
          </div>
          {!loading && (
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
              {images.length} image{images.length !== 1 ? "s" : ""} uploaded
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: 20 }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : images.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <ImageIcon size={24} style={{ color: "var(--color-text-muted)", margin: "0 auto 12px" }} />
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)", marginBottom: 4 }}>
              No proof of play images yet
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
              Images will appear here once uploaded.
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {images.map(pop => <PopCard key={pop.id} pop={pop} />)}
          </div>
        )}
      </div>
    </div>
  );
}