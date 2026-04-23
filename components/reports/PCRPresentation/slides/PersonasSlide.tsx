"use client";

import SlideWrapper from "../SlideWrapper";
import { SlideProps } from "../types";

export default function PersonasSlide({ theme, campaign, pcr, reportDate }: SlideProps) {
  const primary = theme.primary_colour ?? "#95bbc1";
  const textMuted = "rgba(255,255,255,0.25)";
  const textSecondary = "rgba(255, 255, 255, 0.80)";

  const r = parseInt(primary.slice(1, 3), 16);
  const g = parseInt(primary.slice(3, 5), 16);
  const b = parseInt(primary.slice(5, 7), 16);
  const primaryAlpha = (a: number) => `rgba(${r},${g},${b},${a})`;

  return (
    <SlideWrapper theme={theme} label="Personas" reportDate={reportDate}>

      {/* Left */}
      <div style={{
        flex: "0 0 38%",
        padding: "4% 2% 4% 4%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          fontSize: "clamp(22px, 4vw, 48px)",
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
          marginBottom: "6%",
          flexShrink: 0,
        }}>
          Top Audience<br />Personas
        </div>
        <div style={{
          fontSize: 14,
          color: textSecondary,
          lineHeight: 1.7,
          flexShrink: 0,
        }}>
          Personas is a generative tool that gives your data a
          personality. Personas embody the common traits of the
          viewers exposed to your campaign.
        </div>
      </div>

      {/* Right — persona cards */}
      <div style={{
        flex: 1,
        padding: "4% 3.5% 8% 2%",
        display: "flex",
        flexDirection: "column",
        gap: "4%",
        justifyContent: "center",
      }}>
        {pcr.top_personas.slice(0, 2).map((persona, i) => {
          // Extract tags from description — look for age, occupation, education hints
          const tags: string[] = [];
          if (persona.description) {
            const desc = persona.description.toLowerCase();
            if (desc.includes("male") && !desc.includes("female")) tags.push("Male");
            if (desc.includes("female")) tags.push("Female");
            const ageMatch = persona.description.match(/aged?\s+([\d–\-]+)/i);
            if (ageMatch) tags.push(`Age ${ageMatch[1]}`);
            if (desc.includes("trade") || desc.includes("labour")) tags.push("Trades");
            if (desc.includes("university") || desc.includes("education")) tags.push("University");
            if (desc.includes("community") || desc.includes("clerical")) tags.push("Services");
          }
          // Fallback tags if none extracted
          if (tags.length === 0) {
            tags.push("Core Segment", "High Reach");
          }

          return (
            <div key={i} style={{
              background: "#f0f0eeec",
              borderRadius: 30,
              padding: "3.5%",
            }}>
              {/* Persona header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: "1%",
              }}>
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1a1a1a",
                  letterSpacing: "-0.01em",
                }}>
                  {persona.name}
                </div>
              </div>

              {/* Tags */}
              <div style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap" as const,
                marginBottom: "2%",
              }}>
                {tags.map(tag => (
                  <span key={tag} style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    background: primary,
                    color: "#ffffff",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Relevance */}
              <div style={{
                fontSize: 14,
                color: "#1a1a1a",
                fontWeight: 600,
                marginBottom: "1%",
                lineHeight: 1.5,
              }}>
                {persona.relevance}
              </div>

              {/* Description */}
              <div style={{
                fontSize: 12,
                color: "#3a3a3a",
                fontWeight: 400,
                lineHeight: 1.6,
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
