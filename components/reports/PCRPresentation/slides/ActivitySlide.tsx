"use client";

import SlideWrapper from "../SlideWrapper";
import { SlideProps, SuburbData } from "../types";

interface ActivitySlideProps extends SlideProps {
  suburbs: SuburbData[];
}

export default function ActivitySlide({ theme, campaign, pcr, reportDate, suburbs }: ActivitySlideProps) {
  const primary = theme.primary_colour ?? "#95bbc1";
  const textMuted = "rgba(255,255,255,0.35)";

  const topSuburbs = suburbs.slice(0, 5);
  const maxImpressions = topSuburbs[0]?.total_impressions ?? 1;

  // Mapbox static image — centred on Perth
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mapUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+${primary.replace('#','')}(115.8575,-31.9505)/115.8575,-31.9505,11,0/800x500?access_token=${mapboxToken}`
    : null;

  return (
    <SlideWrapper theme={theme} label="Activity" reportDate={reportDate}>
      {/* Left */}
      <div style={{
        flex: "0 0 38%",
        padding: "3.5% 2% 3.5% 3.5%",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          fontSize: "clamp(18px, 3vw, 36px)",
          fontWeight: 700, color: "#fff",
          letterSpacing: "-0.02em", lineHeight: 1.1,
          marginBottom: "5%",
        }}>
          Campaign<br />Activity
        </div>

        {/* Assets + Hours stat box */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8, padding: "4%",
          display: "flex", gap: "8%",
          marginBottom: "6%", flexShrink: 0,
        }}>
          {[
            { value: campaign.total_assets, label: "Assets" },
            { value: Math.round(campaign.total_hours_played), label: "Hours" },
          ].map(({ value, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 3, height: 28, borderRadius: 2,
                background: primary, flexShrink: 0,
              }} />
              <div>
                <div style={{
                  fontSize: "clamp(16px, 2.5vw, 28px)",
                  fontWeight: 700, color: "#fff",
                }}>
                  {value}
                </div>
                <div style={{
                  fontSize: "clamp(7px, 0.8vw, 9px)",
                  color: textMuted, marginTop: 2,
                }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Top suburbs */}
        <div style={{
          fontSize: "clamp(7px, 0.85vw, 9px)",
          color: primary, textTransform: "uppercase",
          letterSpacing: "0.1em", fontWeight: 600,
          marginBottom: 8,
        }}>
          Top Suburbs
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {topSuburbs.map((s, i) => {
            const pct = Math.round((s.total_impressions / maxImpressions) * 100);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontSize: "clamp(7px, 0.85vw, 9px)",
                  color: "rgba(255,255,255,0.5)",
                  width: 72, flexShrink: 0, textAlign: "right",
                }}>
                  {s.suburb}
                </span>
                <div style={{
                  flex: 1, height: 5,
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 3, overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", width: `${pct}%`,
                    background: primary, borderRadius: 3,
                  }} />
                </div>
                <span style={{
                  fontSize: "clamp(7px, 0.85vw, 9px)",
                  color: i === 0 ? primary : textMuted,
                  width: 30, flexShrink: 0,
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
        padding: "3.5% 3.5% 3.5% 0",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          fontSize: "clamp(7px, 0.85vw, 9px)",
          color: primary, textTransform: "uppercase",
          letterSpacing: "0.1em", fontWeight: 600,
          marginBottom: 8, flexShrink: 0,
        }}>
          Geographic Heatmap
        </div>
        <div style={{
          flex: 1, borderRadius: 10, overflow: "hidden",
          background: "#1e2428",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          {mapUrl ? (
            <img
              src={mapUrl}
              alt="Geographic heatmap"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "clamp(8px, 0.9vw, 10px)",
              color: "rgba(255,255,255,0.15)",
            }}>
              Map unavailable — set NEXT_PUBLIC_MAPBOX_TOKEN
            </div>
          )}
        </div>
      </div>
    </SlideWrapper>
  );
}
