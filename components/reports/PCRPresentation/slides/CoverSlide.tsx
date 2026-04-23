"use client";

import SlideWrapper from "../SlideWrapper";
import SlideHeader from "../SlideHeader";
import { SlideProps, PopImage } from "../types";
import { formatCampaignDate } from "@/lib/campaigns";

interface CoverSlideProps extends SlideProps {
  heroImage: PopImage | null;
}

export default function CoverSlide({ theme, campaign, pcr, reportDate, heroImage }: CoverSlideProps) {
  const primary = theme.primary_colour ?? "#95bbc1";
  const textMuted = "rgba(255,255,255,0.25)";
  const textSecondary = "rgba(255, 255, 255, 0.80)";

  const displayName = campaign.campaign_name.includes("|")
    ? campaign.campaign_name.split("|")[1]?.trim() ?? campaign.campaign_name
    : campaign.campaign_name;

  const formattedDate = new Date(reportDate).toLocaleDateString("en-AU", {
    day: "numeric", month: "short", year: "numeric"
  });

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
        {/* Left column */}
        <div style={{
          flex: "0 0 44%",
          padding: "4% 3% 5% 4%",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Logo */}
          {theme.logo_url && (
            <img
              src={theme.logo_url}
              alt="Organisation logo"
              style={{
                height: "clamp(20px, 3vw, 38px)",
                maxWidth: 200,
                objectFit: "contain",
                objectPosition: "left",
                display: "block",
                marginBottom: "6%",
              }}
              onError={e => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )}

          {/* Campaign name */}
          <div style={{
            fontSize: "clamp(22px, 4vw, 48px)",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            marginBottom: "6%",
            flexShrink: 0,
          }}>
            {displayName}
          </div>

          {/* Meta grid */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "auto",
            flexShrink: 0,
          }}>
            {/* Row 1: Advertiser + Agency */}
            <div style={{ display: "flex", gap: "8%", marginBottom: "5%" }}>
              <div>
                <div style={{
                  fontSize: 12,
                  color: primary,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                  marginBottom: 4,
                }}>
                  Advertiser
                </div>
                <div style={{
                  fontSize: "clamp(9px, 0.9vw, 14px)",
                  color: textSecondary,
                }}>
                  {campaign.advertiser_name ?? "—"}
                </div>
              </div>
              {campaign.agency_name && (
                <div>
                  <div style={{
                    fontSize: 12,
                    color: primary,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                    marginBottom: 4,
                  }}>
                    Agency
                  </div>
                  <div style={{
                    fontSize: "clamp(9px, 0.9vw, 14px)",
                    color: textSecondary,
                  }}>
                    {campaign.agency_name}
                  </div>
                </div>
              )}
            </div>

            {/* Row 2: Period */}
            <div style={{ marginBottom: "5%" }}>
              <div style={{
                fontSize: 12,
                color: primary,
                textTransform: "uppercase" as const,
                letterSpacing: "0.1em",
                fontWeight: 600,
                marginBottom: 4,
              }}>
                Period
              </div>
              <div style={{
                fontSize: "clamp(9px, 0.9vw, 14px)",
                color: textSecondary,
              }}>
                {formatCampaignDate(campaign.start_date)} – {formatCampaignDate(campaign.end_date)}
              </div>
            </div>

            {/* Row 3: Region */}
            <div>
              <div style={{
                fontSize: 12,
                color: primary,
                textTransform: "uppercase" as const,
                letterSpacing: "0.1em",
                fontWeight: 600,
                marginBottom: 4,
              }}>
                Region
              </div>
              <div style={{
                fontSize: "clamp(9px, 0.9vw, 14px)",
                color: textSecondary,
                fontWeight: 500,
              }}>
                {campaign.regions?.[0] ?? "—"}
              </div>
            </div>
          </div>

          {/* Website */}
          {theme.website && (
            <div style={{
              fontSize: 13,
              color: textSecondary,
              marginBottom: "3%",
              flexShrink: 0,
            }}>
              {theme.website}
            </div>
          )}

          {/* Short rule under website */}
          <div style={{
            height: 2,
            width: "45%",
            background: textSecondary,
            marginBottom: "3%",
            flexShrink: 0,
          }} />

          {/* Brand statement */}
          {theme.brand_statement && (
            <div style={{
              fontSize: 12,
              color: textSecondary,
              lineHeight: 1.65,
              flexShrink: 0,
            }}>
              {theme.brand_statement}
            </div>
          )}
        </div>

        {/* Right column — hero image */}
        <div style={{
          flex: 1,
          padding: "0% 3% 4% 1.5%",
          display: "flex",
        }}>
          <div style={{
            flex: 1,
            borderRadius: 16,
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
                  No cover image selected
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
