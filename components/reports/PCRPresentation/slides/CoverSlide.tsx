"use client";

import SlideWrapper from "../SlideWrapper";
import { SlideProps, PopImage } from "../types";
import { formatCampaignDate } from "@/lib/campaigns";

interface CoverSlideProps extends SlideProps {
  heroImage: PopImage | null;
}

export default function CoverSlide({ theme, campaign, pcr, reportDate, heroImage }: CoverSlideProps) {
  const primary = theme.primary_colour ?? "#95bbc1";
  const textMuted = "rgba(255,255,255,0.35)";
  const textSecondary = "rgba(255,255,255,0.6)";

  return (
    <SlideWrapper theme={theme} reportDate={reportDate} headerLabel={false}>
      {/* Left column */}
      <div style={{
        flex: "0 0 45%",
        padding: "4% 3% 4% 3.5%",
        display: "flex", flexDirection: "column",
      }}>
        {/* Logo */}
        {theme.logo_url && (
          <img
            src={theme.logo_url}
            alt="Organisation logo"
            style={{
              height: "clamp(18px, 2.5vw, 32px)",
              objectFit: "contain",
              objectPosition: "left",
              marginBottom: "6%",
              maxWidth: 160,
            }}
          />
        )}

        {/* Campaign name */}
        <div style={{
          fontSize: "clamp(22px, 4vw, 44px)",
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
          marginBottom: "5%",
        }}>
          {campaign.campaign_name}
        </div>

        {/* Meta grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "4%",
          marginBottom: "6%",
        }}>
          {[
            { label: "Advertiser", value: campaign.advertiser_name ?? "—" },
            { label: "Agency",     value: campaign.agency_name ?? "—" },
            { label: "Period",     value: `${formatCampaignDate(campaign.start_date)} – ${formatCampaignDate(campaign.end_date)}` },
            { label: "Region",     value: campaign.regions?.[0] ?? "—", accent: true },
          ].map(({ label, value, accent }) => (
            <div key={label}>
              <div style={{
                fontSize: "clamp(7px, 0.8vw, 9px)",
                color: primary,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 600,
                marginBottom: 4,
              }}>
                {label}
              </div>
              <div style={{
                fontSize: "clamp(8px, 0.9vw, 10px)",
                color: accent ? primary : textSecondary,
              }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: "4%" }} />

        {/* Website */}
        {theme.website && (
          <div style={{
            fontSize: "clamp(7px, 0.85vw, 9px)",
            color: primary,
            marginBottom: "3%",
          }}>
            {theme.website}
          </div>
        )}

        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", width: "40%", marginBottom: "3%" }} />

        {/* Brand statement */}
        {theme.brand_statement && (
          <div style={{
            fontSize: "clamp(7px, 0.85vw, 9px)",
            color: textMuted,
            lineHeight: 1.6,
          }}>
            {theme.brand_statement}
          </div>
        )}
      </div>

      {/* Right column — hero image */}
      <div style={{
        flex: 1,
        padding: "3.5% 3.5% 3.5% 0",
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
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div style={{
              fontSize: "clamp(8px, 0.9vw, 10px)",
              color: "rgba(255,255,255,0.15)",
              textAlign: "center",
            }}>
              No proof of play images uploaded yet
            </div>
          )}
        </div>
      </div>
    </SlideWrapper>
  );
}
