"use client";

import SlideWrapper from "../SlideWrapper";
import { SlideProps, DemoSegment } from "../types";

interface AudienceSlideProps extends SlideProps {
  demographics: DemoSegment[];
}

function findSegment(demographics: DemoSegment[], type: string) {
  return demographics.find(s => s.segment_type === type)?.data ?? [];
}

export default function AudienceSlide({ theme, campaign, pcr, reportDate, demographics }: AudienceSlideProps) {
  const primary = theme.primary_colour ?? "#95bbc1";
  const bg = theme.presentation_bg_colour ?? "#1a1a1a";
  const textMuted = "rgba(255,255,255,0.35)";
  const textSecondary = "rgba(255,255,255,0.6)";

  const genderData = findSegment(demographics, "gender");
  const occupationData = findSegment(demographics, "occupation").slice(0, 5);
  const ageData = findSegment(demographics, "age");
  const maxOcc = Math.max(...occupationData.map(d => d.proportion), 0.01);
  const maxAge = Math.max(...ageData.map(d => d.proportion), 0.01);

  const maleItem = genderData.find(g => g.key === "male" || g.label.toLowerCase().includes("male") && !g.label.toLowerCase().includes("female"));
  const femaleItem = genderData.find(g => g.key === "female" || g.label.toLowerCase().includes("female"));
  const malePct = maleItem ? Math.round(maleItem.proportion * 100) : 51;
  const femalePct = femaleItem ? Math.round(femaleItem.proportion * 100) : 49;

  return (
    <SlideWrapper theme={theme} label="Audience" reportDate={reportDate}>
      {/* Left */}
      <div style={{
        flex: "0 0 45%",
        padding: "3.5% 2% 3.5% 3.5%",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          fontSize: "clamp(18px, 3vw, 36px)",
          fontWeight: 700, color: "#fff",
          letterSpacing: "-0.02em", lineHeight: 1.1,
          marginBottom: "4%",
        }}>
          Audience<br />Composition
        </div>

        <div style={{
          fontSize: "clamp(7px, 0.85vw, 9px)", color: primary,
          textTransform: "uppercase", letterSpacing: "0.1em",
          fontWeight: 600, marginBottom: 6,
        }}>
          Target Audience Alignment
        </div>
        <div style={{
          fontSize: "clamp(7px, 0.9vw, 10px)", color: textMuted,
          lineHeight: 1.6, marginBottom: "4%",
        }}>
          {pcr.target_summary}
        </div>

        {/* Gender */}
        <div style={{
          display: "flex", alignItems: "center",
          gap: "6%", marginBottom: "4%",
        }}>
          <svg width="clamp(44px,7vw,70px)" height="clamp(44px,7vw,70px)" viewBox="0 0 70 70">
            <circle cx="35" cy="35" r="28" fill="none"
              stroke="rgba(255,255,255,0.08)" strokeWidth="9"/>
            <circle cx="35" cy="35" r="28" fill="none"
              stroke={primary} strokeWidth="9"
              strokeDasharray={`${malePct * 1.759} ${(100 - malePct) * 1.759}`}
              strokeDashoffset="44" strokeLinecap="round"/>
            <text x="35" y="31" textAnchor="middle"
              fill="#fff" fontSize="8" fontWeight="700">
              {malePct}:{femalePct}
            </text>
            <text x="35" y="41" textAnchor="middle"
              fill="rgba(255,255,255,0.3)" fontSize="6">
              M/F
            </text>
          </svg>
          <div>
            <div style={{
              fontSize: "clamp(12px, 1.8vw, 20px)",
              fontWeight: 700, color: "#fff",
            }}>
              {malePct} : {femalePct}
            </div>
            <div style={{
              fontSize: "clamp(7px, 0.8vw, 9px)",
              color: textMuted, marginTop: 2,
            }}>
              MALE  FEMALE
            </div>
          </div>
        </div>

        <div style={{
          fontSize: "clamp(7px, 0.85vw, 9px)", color: primary,
          textTransform: "uppercase", letterSpacing: "0.1em",
          fontWeight: 600, marginBottom: 8,
        }}>
          Occupation Breakdown
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {occupationData.map((o, i) => {
            const pct = Math.round((o.proportion / maxOcc) * 100);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontSize: "clamp(7px, 0.85vw, 9px)",
                  color: "rgba(255,255,255,0.5)",
                  width: 90, flexShrink: 0, textAlign: "right",
                }}>
                  {o.label}
                </span>
                <div style={{
                  flex: 1, height: 5,
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 3, overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", width: `${pct}%`,
                    background: primary,
                    opacity: 1 - i * 0.15,
                    borderRadius: 3,
                  }} />
                </div>
                <span style={{
                  fontSize: "clamp(7px, 0.85vw, 9px)",
                  color: i === 0 ? primary : textMuted,
                  width: 34, flexShrink: 0,
                }}>
                  {Math.round(o.proportion * 100)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right — age chart in light card */}
      <div style={{
        flex: 1,
        padding: "3.5% 3.5% 3.5% 0",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          fontSize: "clamp(7px, 0.85vw, 9px)", color: primary,
          textTransform: "uppercase", letterSpacing: "0.1em",
          fontWeight: 600, marginBottom: 8, flexShrink: 0,
        }}>
          Impressions by Age
        </div>
        <div style={{
          flex: 1, background: "#f0f0f0",
          borderRadius: 10, padding: "5%",
          display: "flex", flexDirection: "column",
        }}>
          {/* Bars */}
          <div style={{
            flex: 1, display: "flex",
            alignItems: "flex-end", gap: "4%",
          }}>
            {ageData.map((a, i) => {
              const pct = Math.round((a.proportion / maxAge) * 85);
              return (
                <div key={i} style={{
                  flex: 1, display: "flex",
                  flexDirection: "column",
                  alignItems: "center", justifyContent: "flex-end",
                  height: "100%", gap: 4,
                }}>
                  <div style={{
                    fontSize: "clamp(7px, 0.8vw, 9px)",
                    color: "#555", fontWeight: 600,
                  }}>
                    {Math.round(a.proportion * 100)}%
                  </div>
                  <div style={{
                    width: "70%", height: `${pct}%`,
                    background: primary,
                    borderRadius: "3px 3px 0 0",
                    minHeight: 4,
                  }} />
                </div>
              );
            })}
          </div>
          {/* Labels */}
          <div style={{
            display: "flex", gap: "4%", marginTop: 6,
          }}>
            {ageData.map((a, i) => (
              <div key={i} style={{
                flex: 1, textAlign: "center",
                fontSize: "clamp(6px, 0.75vw, 8px)",
                color: "#888",
              }}>
                {a.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideWrapper>
  );
}
