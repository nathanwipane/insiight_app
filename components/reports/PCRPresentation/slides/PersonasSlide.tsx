"use client";

import SlideWrapper from "../SlideWrapper";
import { SlideProps } from "../types";

export default function PersonasSlide({ theme, campaign, pcr, reportDate }: SlideProps) {
  const primary = theme.primary_colour ?? "#95bbc1";
  const textMuted = "rgba(255,255,255,0.35)";
  const textSecondary = "rgba(255,255,255,0.6)";

  return (
    <SlideWrapper theme={theme} label="Personas" reportDate={reportDate}>
      {/* Left */}
      <div style={{
        flex: "0 0 38%",
        padding: "3.5% 2% 3.5% 3.5%",
        display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          fontSize: "clamp(22px, 4vw, 48px)",
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
          marginBottom: "4%",
        }}>
          Top Audience<br />Personas
        </div>
        <div style={{
          fontSize: "clamp(7px, 0.9vw, 10px)",
          color: textMuted, lineHeight: 1.6,
        }}>
          Personas is a generative tool that gives your data a personality.
          Personas embody the common traits of the viewers exposed to your campaign.
        </div>

        {/* Decorative blob */}
        <div style={{
          position: "absolute", bottom: "-8%", left: "-10%",
          opacity: 0.1, pointerEvents: "none",
        }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            <path d="M100 10 C150 20 185 65 175 115 C165 160 125 185 80 175 C35 165 5 128 10 82 C15 40 52 0 100 10Z"
              fill={primary}/>
            <circle cx="70" cy="148" r="28" fill={primary}/>
          </svg>
        </div>

        {/* Star */}
        <div style={{
          position: "absolute", bottom: "18%", left: "30%",
          opacity: 0.35, pointerEvents: "none",
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28">
            <path d="M14 3 L16.5 11 L25 11 L18.5 16.5 L21 25 L14 20 L7 25 L9.5 16.5 L3 11 L11.5 11 Z"
              fill={primary}/>
          </svg>
        </div>
      </div>

      {/* Right — persona cards */}
      <div style={{
        flex: 1,
        padding: "3.5% 3.5% 3.5% 2%",
        display: "flex", flexDirection: "column",
        gap: "3%", justifyContent: "center",
      }}>
        {pcr.top_personas.slice(0, 2).map((persona, i) => {
          const initials = persona.name.split(" ").map(w => w[0]).join("").slice(0, 2);
          return (
            <div key={i} style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "4%",
            }}>
              <div style={{
                display: "flex", alignItems: "center",
                gap: 10, marginBottom: "3%",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: `rgba(${parseInt(primary.slice(1,3),16)},${parseInt(primary.slice(3,5),16)},${parseInt(primary.slice(5,7),16)},0.15)`,
                  border: `1px solid rgba(${parseInt(primary.slice(1,3),16)},${parseInt(primary.slice(3,5),16)},${parseInt(primary.slice(5,7),16)},0.3)`,
                  display: "flex", alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(9px, 1.1vw, 11px)",
                  fontWeight: 700, color: primary,
                  flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div style={{
                  fontSize: "clamp(11px, 1.4vw, 15px)",
                  fontWeight: 700, color: "#fff",
                }}>
                  {persona.name}
                </div>
              </div>

              {/* Tags — extract from description */}
              <div style={{
                display: "flex", gap: 4, flexWrap: "wrap",
                marginBottom: "3%",
              }}>
                {["Technicians & Trades", "Age 35–49", "Trades Education"].map(tag => (
                  <span key={tag} style={{
                    display: "inline-block",
                    padding: "2px 8px", borderRadius: 20,
                    fontSize: "clamp(7px, 0.8vw, 9px)", fontWeight: 500,
                    background: `rgba(${parseInt(primary.slice(1,3),16)},${parseInt(primary.slice(3,5),16)},${parseInt(primary.slice(5,7),16)},0.12)`,
                    color: primary,
                    border: `1px solid rgba(${parseInt(primary.slice(1,3),16)},${parseInt(primary.slice(3,5),16)},${parseInt(primary.slice(5,7),16)},0.25)`,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              <div style={{
                fontSize: "clamp(7px, 0.85vw, 9px)",
                color: primary, fontWeight: 600,
                marginBottom: "2%", lineHeight: 1.5,
              }}>
                {persona.relevance}
              </div>
              <div style={{
                fontSize: "clamp(7px, 0.85vw, 9px)",
                color: textMuted, lineHeight: 1.6,
              }}>
                {persona.description}
              </div>
            </div>
          );
        })}
      </div>
    </SlideWrapper>
  );
}
