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
  const textMuted = "rgba(255,255,255,0.25)";
  const textSecondary = "rgba(255, 255, 255, 0.80)";

  const genderData = findSegment(demographics, "gender");
  const occupationData = [...findSegment(demographics, "occupation")]
    .sort((a, b) => b.proportion - a.proportion)
    .slice(0, 4);
  const maxOcc = Math.max(...occupationData.map(d => d.proportion), 0.01);
  const ageData = findSegment(demographics, "age");

  const ageBins = [
    {
      label: "18–34",
      proportion: ["age_20_24", "age_25_29", "age_30_34"]
        .reduce((sum, key) => {
          const item = ageData.find(d => d.key === key);
          return sum + (item?.proportion ?? 0);
        }, 0),
    },
    {
      label: "35–49",
      proportion: ["age_35_39", "age_40_44", "age_45_49"]
        .reduce((sum, key) => {
          const item = ageData.find(d => d.key === key);
          return sum + (item?.proportion ?? 0);
        }, 0),
    },
    {
      label: "50–64",
      proportion: ["age_50_54", "age_55_59", "age_60_64"]
        .reduce((sum, key) => {
          const item = ageData.find(d => d.key === key);
          return sum + (item?.proportion ?? 0);
        }, 0),
    },
    {
      label: "65+",
      proportion: ["age_65_69", "age_70_74", "age_75_79", "age_80_84", "age_85_plus"]
        .reduce((sum, key) => {
          const item = ageData.find(d => d.key === key);
          return sum + (item?.proportion ?? 0);
        }, 0),
    },
  ];

  const maxAgeBin = Math.max(...ageBins.map(b => b.proportion), 0.01);

  const maleItem = genderData.find(g =>
    g.key === "male" || (g.label.toLowerCase().includes("male") && !g.label.toLowerCase().includes("female"))
  );
  const femaleItem = genderData.find(g =>
    g.key === "female" || g.label.toLowerCase().includes("female")
  );
  const malePct = maleItem ? Math.round(maleItem.proportion * 100) : 51;
  const femalePct = femaleItem ? Math.round(femaleItem.proportion * 100) : 49;

  // Estimate unique reach per occupation from campaign reach + proportion
  const totalReach = campaign.reach ?? 0;

  return (
    <SlideWrapper theme={theme} label="Audience" reportDate={reportDate}>

      {/* Left column */}
      <div style={{
        flex: "0 0 50%",
        padding: "2% 3% 4% 4%",
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
          Audience<br />Composition
        </div>

        {/* Occupation Breakdown */}
        <div style={{
          fontSize: 12,
          color: primary,
          textTransform: "uppercase" as const,
          letterSpacing: "0.1em",
          fontWeight: 600,
          marginBottom: 12,
          flexShrink: 0,
        }}>
          Occupation Breakdown
        </div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: "6%",
          flexShrink: 0,
        }}>
          {occupationData.map((o, i) => {
            const pct = Math.round((o.proportion / maxOcc) * 100);
            return (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
                <span style={{
                  fontSize: 12,
                  color: textSecondary,
                  width: 180,
                  flexShrink: 0,
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}>
                  {o.label}
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
                    opacity: 1,
                    borderRadius: 3,
                  }} />
                </div>
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: i === 0 ? primary : textSecondary,
                  width: 38,
                  flexShrink: 0,
                  textAlign: "right",
                }}>
                  {Math.round(o.proportion * (campaign.reach ?? 0)).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{
          display: "flex",
          gap: "6%",
          flexShrink: 0,
          height: 210,
        }}>

          {/* Column 1 — Gender */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{
              fontSize: 12,
              color: primary,
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
              fontWeight: 600,
              marginBottom: 12,
            }}>
              Gender Distribution
            </div>
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              flex: 1,
            }}>
              <svg width="140" height="140" viewBox="0 0 70 70">
                <circle cx="35" cy="35" r="28" fill="none"
                  stroke="rgba(255,255,255,0.08)" strokeWidth="9"/>
                <circle cx="35" cy="35" r="28" fill="none"
                  stroke={primary} strokeWidth="9"
                  strokeDasharray={`${malePct * 1.759} ${(100 - malePct) * 1.759}`}
                  strokeDashoffset="44" strokeLinecap="round"/>
                <text x="35" y="35" textAnchor="middle"
                  fill="#fff" fontSize="12" fontWeight="700">
                  {totalReach.toLocaleString()}
                </text>
                <text x="35" y="45" textAnchor="middle"
                  fill="rgba(255,255,255,0.5)" fontSize="7">
                  Total
                </text>
              </svg>
              <div style={{ display: "flex", flexDirection: "row", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)", flexShrink: 0,
                  }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: textSecondary }}>
                    MALE {malePct}%
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: primary, flexShrink: 0,
                  }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: textSecondary }}>
                    FEMALE {femalePct}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 — Age */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{
              fontSize: 12,
              color: primary,
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
              fontWeight: 600,
              marginBottom: 12,
            }}>
              Age Distribution
            </div>
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "flex-end",
              gap: "4%",
              height: 140,
            }}>
              {ageBins.map((a, i) => {
                const pct = Math.round((a.proportion / maxAgeBin) * 100);
                return (
                  <div key={i} style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    height: "100%",
                    gap: 4,
                  }}>
                    <div style={{
                      fontSize: 12,
                      color: textSecondary,
                      fontWeight: 700,
                    }}>
                      {Math.round(a.proportion * 100)}%
                    </div>
                    <div style={{
                      width: "60%",
                      height: `${pct}%`,
                      background: primary,
                      opacity: 1,
                      borderRadius: "3px 3px 0 0",
                      minHeight: 4,
                    }} />
                    <div style={{
                      fontSize: 12,
                      color: textSecondary,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}>
                      {a.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Right column */}
      <div style={{
        flex: 1,
        padding: "0% 3% 4% 0%",
        display: "flex",
        flexDirection: "column",
        paddingTop: "4%",
      }}>

        {/* Target Audience Alignment */}
        <div style={{
          fontSize: 12,
          color: primary,
          textTransform: "uppercase" as const,
          letterSpacing: "0.1em",
          fontWeight: 600,
          marginBottom: 8,
          flexShrink: 0,
        }}>
          Target Audience Alignment
        </div>
        <div style={{
          fontSize: 14,
          color: textSecondary,
          lineHeight: 1.6,
          marginBottom: "6%",
          flexShrink: 0,
        }}>
          {pcr.target_summary}
        </div>

        {/* Audience Table */}
        <div style={{
          fontSize: 12,
          color: primary,
          textTransform: "uppercase" as const,
          letterSpacing: "0.1em",
          fontWeight: 600,
          marginBottom: 10,
          flexShrink: 0,
        }}>
          Audience Breakdown
        </div>

        {/* Table */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}>
          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 0.5fr",
            gap: 8,
            padding: "10px 10px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "8px 8px 0 0",
            flexShrink: 0,
          }}>
            {["Audience", "Unique Reach", "Audience Share", "Index"].map(h => (
              <div key={h} style={{
                fontSize: 12,
                color: primary,
                fontWeight: 600,
                textTransform: "uppercase" as const,
                letterSpacing: "0.06em",
                textAlign: h === "Audience" ? "left" : "right",
              }}>
                {h}
              </div>
            ))}
          </div>

          {/* Table rows */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
          }}>
            {occupationData.map((o, i) => {
              const uniqueReach = Math.round(o.proportion * totalReach);
              const audienceShare = `${Math.round(o.proportion * 100)}%`;
              const index = Math.round(o.index);
              const isEven = i % 2 === 0;
              return (
                <div key={i} style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 0.5fr",
                  gap: 8,
                  padding: "12px 10px",
                  background: isEven
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(255,255,255,0.1)",
                  borderRadius: i === occupationData.length - 1
                    ? "0 0 8px 8px"
                    : 0,
                }}>
                  <div style={{
                    fontSize: 12,
                    color: textSecondary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {o.label}
                  </div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: textSecondary,
                    textAlign: "right",
                  }}>
                    {uniqueReach.toLocaleString()}
                  </div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: textSecondary,
                    textAlign: "right",
                  }}>
                    {audienceShare}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: index > 100 ? primary : textSecondary,
                    textAlign: "right",
                    fontWeight: 700,
                  }}>
                    {index}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SlideWrapper>
  );
}
