"use client";

import SlideHeader from "../SlideHeader";
import { SlideProps } from "../types";
import { formatCampaignDate } from "@/lib/campaigns";

export default function CloseSlide({ theme, campaign, pcr, reportDate }: SlideProps) {
  const primary = theme.primary_colour ?? "#95bbc1";
  const textSecondary = "rgba(255, 255, 255, 0.80)";
  const textMuted = "rgba(255,255,255,0.25)";

  const displayName = campaign.campaign_name.includes("|")
    ? campaign.campaign_name.split("|")[1]?.trim() ?? campaign.campaign_name
    : campaign.campaign_name;

  const considerations = theme.considerations
    ?.split("\n\n")
    .filter(Boolean) ?? [];

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: theme.presentation_bg_colour ?? "#1a1a1a",
      display: "flex",
      flexDirection: "column",
      fontFamily: theme.font_family
        ? `${theme.font_family}, var(--font-bricolage), sans-serif`
        : "var(--font-bricolage), 'Bricolage Grotesque', sans-serif",
    }}>
      <SlideHeader theme={theme} reportDate={reportDate} />

      {/* Body */}
      <div style={{
        flex: 1,
        display: "flex",
        minHeight: 0,
      }}>
        {/* Left */}
        <div style={{
          flex: "0 0 45%",
          padding: "4% 4% 6% 10%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}>
          {theme.logo_url && (
            <img
              src={theme.logo_url}
              alt="Logo"
              style={{
                height: "clamp(20px, 3vw, 38px)",
                objectFit: "contain",
                objectPosition: "left",
                marginBottom: "8%",
                maxWidth: 180,
              }}
              onError={e => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )}

          <div style={{
            fontSize: "clamp(22px, 4vw, 48px)",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            marginBottom: "8%",
          }}>
            {displayName}<br />
          </div>

          {theme.website && (
            <div style={{
              fontSize: 16,
              color: textSecondary,
              marginBottom: "4%",
            }}>
              {theme.website}
            </div>
          )}

          <div style={{
            height: 2,
            background: textSecondary,
            width: "55%",
            marginBottom: "4%",
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {theme.phone_numbers.map((p, i) => (
              <div key={i} style={{
                fontSize: 14,
                color: textSecondary,
              }}>
                {p.label}: {p.number}
              </div>
            ))}
          </div>
        </div>

        {/* Right — considerations */}
        <div style={{
          flex: 1,
          padding: "4% 10% 6% 4%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 16,
        }}>
          {considerations.map((text, i) => (
            <div key={i} style={{
              fontSize: 14,
              color: textSecondary,
              lineHeight: 1.7,
            }}>
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
