"use client";

import SlideWrapper from "../SlideWrapper";
import { SlideProps } from "../types";
import { formatCampaignDate } from "@/lib/campaigns";

export default function CloseSlide({ theme, campaign, pcr, reportDate }: SlideProps) {
  const primary = theme.primary_colour ?? "#95bbc1";
  const textMuted = "rgba(255,255,255,0.35)";

  const considerations = theme.considerations?.split("\n\n").filter(Boolean) ?? [];

  return (
    <SlideWrapper theme={theme} reportDate={reportDate} headerLabel={false}>
      {/* Left */}
      <div style={{
        flex: "0 0 45%",
        padding: "4% 3% 4% 3.5%",
        display: "flex", flexDirection: "column",
        justifyContent: "center",
      }}>
        {theme.logo_url && (
          <img
            src={theme.logo_url}
            alt="Logo"
            style={{
              height: "clamp(16px, 2.5vw, 28px)",
              objectFit: "contain", objectPosition: "left",
              marginBottom: "6%", maxWidth: 140,
            }}
          />
        )}

        <div style={{
          fontSize: "clamp(16px, 2.8vw, 32px)",
          fontWeight: 700, color: "#fff",
          letterSpacing: "-0.02em", lineHeight: 1.15,
          marginBottom: "6%",
        }}>
          {campaign.campaign_name}<br />
          <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>
            Post-Campaign Report
          </span>
        </div>

        {theme.website && (
          <div style={{
            fontSize: "clamp(7px, 0.85vw, 9px)",
            color: primary, marginBottom: "3%",
          }}>
            {theme.website}
          </div>
        )}

        <div style={{
          height: 1, background: "rgba(255,255,255,0.08)",
          width: "40%", marginBottom: "3%",
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {theme.phone_numbers.map((p, i) => (
            <div key={i} style={{
              fontSize: "clamp(7px, 0.85vw, 9px)",
              color: "rgba(255,255,255,0.4)",
            }}>
              {p.label}: {p.number}
            </div>
          ))}
        </div>
      </div>

      {/* Right — considerations */}
      <div style={{
        flex: 1,
        padding: "4% 3.5% 4% 3%",
        display: "flex", flexDirection: "column",
        justifyContent: "center", gap: "4%",
      }}>
        {considerations.map((text, i) => (
          <div key={i} style={{
            fontSize: "clamp(7px, 0.85vw, 9px)",
            color: i === considerations.length - 1
              ? "rgba(255,255,255,0.2)"
              : textMuted,
            lineHeight: 1.7,
            borderTop: i > 0
              ? "1px solid rgba(255,255,255,0.05)"
              : "none",
            paddingTop: i > 0 ? "3%" : 0,
          }}>
            {text}
          </div>
        ))}
      </div>
    </SlideWrapper>
  );
}
