"use client";

import SlideWrapper from "../SlideWrapper";
import AustraliaMap from "../AustraliaMap";
import { SlideProps, SuburbData } from "../types";

interface ActivitySlideStaticProps extends SlideProps {
  suburbs: SuburbData[];
}

export default function ActivitySlideStatic({ theme, campaign, pcr, reportDate, suburbs }: ActivitySlideStaticProps) {
  const primary = theme.primary_colour ?? "#95bbc1";
  const textSecondary = "rgba(255, 255, 255, 0.80)";
  const textMuted = "rgba(255,255,255,0.25)";

  const topSuburbs = suburbs.slice(0, 5);
  const maxImpressions = topSuburbs[0]?.total_impressions ?? 1;

  // Fix hours — stored as string, parse to float then round
  const hoursPlayed = Math.round(parseFloat(String(campaign.total_hours_played)));

  return (
    <SlideWrapper theme={theme} label="Activity" reportDate={reportDate}>
      {/* Left column */}
      <div style={{
        flex: "0 0 38%",
        padding: "4% 3% 4% 4%",
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
          marginBottom: "6%",
          flexShrink: 0,
        }}>
          Campaign<br />Activity
        </div>

        {/* Assets + Hours stat box */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: 10,
          padding: "5% 6%",
          display: "flex",
          gap: "12%",
          marginBottom: "8%",
          flexShrink: 0,
        }}>
          {[
            { value: campaign.total_assets, label: "Assets" },
            { value: hoursPlayed, label: "Hours" },
          ].map(({ value, label }) => (
            <div key={label} style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}>
              <div style={{
                width: 10,
                height: 60,
                borderRadius: 10,
                background: primary,
                flexShrink: 0,
              }} />
              <div>
                <div style={{
                  fontSize: "clamp(20px, 3vw, 36px)",
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}>
                  {value}
                </div>
                <div style={{
                  fontSize: 12,
                  color: textSecondary,
                  marginTop: 4,
                }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Top suburbs label */}
        <div style={{
          fontSize: 12,
          color: primary,
          textTransform: "uppercase" as const,
          letterSpacing: "0.1em",
          fontWeight: 600,
          marginBottom: 12,
          flexShrink: 0,
        }}>
          Top Suburbs
        </div>

        {/* Suburb bars */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          {topSuburbs.map((s, i) => {
            const pct = Math.round((s.total_impressions / maxImpressions) * 100);
            return (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
                <span style={{
                  fontSize: 14,
                  color: textSecondary,
                  width: 80,
                  flexShrink: 0,
                  textAlign: "right",
                }}>
                  {s.suburb}
                </span>
                <div style={{
                  flex: 1,
                  height: 6,
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: primary,
                    borderRadius: 3,
                    opacity: 1,
                  }} />
                </div>
                <span style={{
                  fontSize: 14,
                  color: i === 0 ? primary : textMuted,
                  width: 36,
                  flexShrink: 0,
                  textAlign: "right",
                }}>
                  {s.total_impressions}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right — map */}
      <div style={{
        flex: 1,
        padding: "0% 3% 4% 2%",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Map label */}
        <div style={{
          fontSize: 12,
          color: primary,
          textTransform: "uppercase" as const,
          letterSpacing: "0.1em",
          fontWeight: 600,
          marginBottom: 10,
          flexShrink: 0,
          paddingTop: "4%",
        }}>
          Geographic Heatmap
        </div>

        {/* Map container — fills remaining height */}
        <div style={{
          flex: 1,
          borderRadius: 16,
          overflow: "hidden",
          background: "#1a1f2a",
          minHeight: 0,
        }}>
          <AustraliaMap
            regions={campaign.regions ?? []}
            primary={primary}
          />
        </div>
      </div>
    </SlideWrapper>
  );
}
