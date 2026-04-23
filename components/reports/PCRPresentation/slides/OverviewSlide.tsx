"use client";

import SlideWrapper from "../SlideWrapper";
import { SlideProps, PopImage } from "../types";
import { formatImpressions } from "@/lib/campaigns";

interface OverviewSlideProps extends SlideProps {
  heroImage: PopImage | null;
}

export default function OverviewSlide({ theme, campaign, pcr, reportDate, heroImage }: OverviewSlideProps) {
  const primary = theme.primary_colour ?? "#95bbc1";
  const bg = theme.presentation_bg_colour ?? "#1a1a1a";
  const textMuted = "rgba(255,255,255,0.35)";
  const textSecondary = "rgba(255,255,255,0.6)";

  // CPM calculation — placeholder if not available
  const cpm = campaign.total_impressions > 0
    ? ((campaign.reach / campaign.total_impressions) * 1000).toFixed(2)
    : "—";

  const metrics = [
    { label: "Impressions", value: formatImpressions(campaign.total_impressions), accent: true },
    { label: "Reach",       value: formatImpressions(campaign.reach) },
    { label: "Frequency",   value: `${Number(campaign.frequency).toFixed(2)}x` },
    { label: "Ad Plays",    value: campaign.total_ad_plays.toLocaleString() },
  ];

  // Split executive summary into bullet points on ". " boundaries
  const bullets = pcr.executive_summary
    .split(/(?<=\.)\s+/)
    .filter(Boolean)
    .slice(0, 4);

  return (
    <SlideWrapper theme={theme} label="Overview" reportDate={reportDate}>
      {/* Left — PoP image */}
      <div style={{
        flex: "0 0 40%",
        padding: "3.5% 2% 3.5% 3.5%",
      }}>
        <div style={{
          width: "100%",
          height: "100%",
          borderRadius: 10,
          overflow: "hidden",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {heroImage ? (
            <img
              src={heroImage.url}
              alt={heroImage.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ fontSize: "clamp(8px,0.9vw,10px)", color: "rgba(255,255,255,0.15)" }}>
              No image
            </div>
          )}
        </div>
      </div>

      {/* Right — metrics + summary */}
      <div style={{
        flex: 1,
        padding: "3.5% 3.5% 3.5% 2%",
        display: "flex",
        flexDirection: "column",
      }}>
        <div style={{
          fontSize: "clamp(16px, 2.8vw, 32px)",
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "-0.02em",
          marginBottom: "4%",
        }}>
          Campaign Overview
        </div>

        {/* Metrics card */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: "3% 4%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "2%",
          marginBottom: "4%",
          flexShrink: 0,
        }}>
          {metrics.map(m => (
            <div key={m.label}>
              <div style={{
                fontSize: "clamp(7px, 0.8vw, 9px)",
                color: textMuted,
                marginBottom: 6,
              }}>
                {m.label}
              </div>
              <div style={{
                fontSize: "clamp(14px, 2.8vw, 32px)",
                fontWeight: 700,
                color: m.accent ? primary : "#fff",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* Executive summary */}
        <div style={{
          fontSize: "clamp(7px, 0.85vw, 9px)",
          color: primary,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 600,
          marginBottom: 10,
        }}>
          Executive Summary
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {bullets.map((b, i) => (
            <div key={i} style={{ display: "flex", gap: 8 }}>
              <span style={{
                color: primary,
                fontSize: "clamp(7px, 0.8vw, 9px)",
                flexShrink: 0,
                marginTop: 1,
              }}>●</span>
              <span style={{
                fontSize: "clamp(7px, 0.9vw, 10px)",
                color: textSecondary,
                lineHeight: 1.6,
              }}>
                {b}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SlideWrapper>
  );
}
