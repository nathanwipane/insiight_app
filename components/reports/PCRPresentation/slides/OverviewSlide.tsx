"use client";

import SlideWrapper from "../SlideWrapper";
import { Wand2 } from "lucide-react";
import { SlideProps, PopImage, PCRConfig } from "../types";
import { formatImpressions } from "@/lib/campaigns";

interface OverviewSlideProps extends SlideProps {
  heroImage: PopImage | null;
  pcrConfig: PCRConfig | null;
}

export default function OverviewSlide({ theme, campaign, pcr, reportDate, heroImage, pcrConfig }: OverviewSlideProps) {
  console.log('OverviewSlide pcrConfig:', pcrConfig);
  const primary = theme.primary_colour ?? "#95bbc1";
  const textMuted = "rgba(255,255,255,0.25)";
  const textSecondary = "rgba(255, 255, 255, 0.80)";

  const metrics = [
    {
      label: "Impressions",
      value: formatImpressions(campaign.total_impressions),
      accent: true
    },
    {
      label: "Reach",
      value: formatImpressions(campaign.reach)
    },
    {
      label: "Frequency",
      value: `${Number(campaign.frequency).toFixed(2)}x`
    },
    ...(pcrConfig?.cpm !== null && pcrConfig?.cpm !== undefined
      ? [{
          label: "CPM",
          value: `$${Number(pcrConfig.cpm).toFixed(2)}`
        }]
      : []
    ),
  ];

  console.log('OverviewSlide metrics:', metrics);

  const bullets = pcr.executive_summary
    .split(/(?<=\.)\s+/)
    .filter(Boolean)
    .slice(0, 4);

  return (
    <SlideWrapper theme={theme} label="Overview" reportDate={reportDate}>
      {/* Left — PoP image */}
      <div style={{
        flex: "0 0 50%",
        padding: "0% 2% 4% 3.5%",
      }}>
        <div style={{
          width: "100%",
          height: "100%",
          borderRadius: 16,
          overflow: "hidden",
          background: "rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {heroImage ? (
            <img
              src={heroImage.url}
              alt={heroImage.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3"
                  stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
                <circle cx="8.5" cy="8.5" r="1.5"
                  fill="rgba(255,255,255,0.1)"/>
                <path d="M3 15l5-5 4 4 3-3 6 6"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1.5" strokeLinecap="round"
                  strokeLinejoin="round"/>
              </svg>
              <span style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.12)",
              }}>
                No image
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right — metrics + summary */}
      <div style={{
        flex: 1,
        padding: "4% 3.5% 4% 2%",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Title */}
        <div style={{
          fontSize: "clamp(22px, 4vw, 48px)",
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
          marginBottom: "5%",
          flexShrink: 0,
        }}>
          Campaign Overview
        </div>

        {/* Metrics card */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: 12,
          padding: "3% 4%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "2%",
          marginBottom: "6%",
          flexShrink: 0,
        }}>
          {metrics.map(m => (
            <div key={m.label}>
              <div style={{
                fontSize: 12,
                color: primary,
                textTransform: "uppercase" as const,
                letterSpacing: "0.1em",
                fontWeight: 600,
                marginBottom: 8,
              }}>
                {m.label}
              </div>
              <div style={{
                fontSize: "clamp(20px, 3.5vw, 42px)",
                fontWeight: 700,
                color: m.accent ? primary : "#ffffff",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* Executive summary label */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12,
          flexShrink: 0,
        }}>
          <Wand2 size={16} style={{ color: primary, flexShrink: 0 }} />
          <span style={{
            fontSize: 12,
            color: primary,
            textTransform: "uppercase" as const,
            letterSpacing: "0.1em",
            fontWeight: 600,
          }}>
            Executive Summary
          </span>
        </div>

        {/* Bullets */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
          {bullets.map((b, i) => (
            <div key={i} style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: primary,
                flexShrink: 0,
                marginTop: 4,
              }} />
              <span style={{
                fontSize: 14,
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
