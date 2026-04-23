"use client";

import { OrgTheme } from "./types";

interface SlideWrapperProps {
  theme: OrgTheme;
  label?: string;        // e.g. "Overview" — shown with dot in header
  reportDate: string;
  children: React.ReactNode;
  headerLabel?: boolean; // if false, shows "Post-Campaign Report" text instead of dot label
}

export default function SlideWrapper({
  theme,
  label,
  reportDate,
  children,
  headerLabel = true,
}: SlideWrapperProps) {
  const bg = theme.presentation_bg_colour ?? "#1a1a1a";
  const primary = theme.primary_colour ?? "#95bbc1";

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: bg,
      display: "flex",
      flexDirection: "column",
      fontFamily: theme.font_family
        ? `${theme.font_family}, var(--font-bricolage), sans-serif`
        : "var(--font-bricolage), 'Bricolage Grotesque', sans-serif",
    }}>
      {/* Header bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "2.4% 3.5%",
        flexShrink: 0,
      }}>
        {/* Left — dot + slide label */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 14,
          color: "rgba(255,255,255,0.7)",
          fontWeight: 600,
          letterSpacing: "0.02em",
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: primary,
            flexShrink: 0,
          }} />
          {label}
        </div>

        {/* Right — Powered by Insiight */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          fontSize: 14,
          color: "rgba(255,255,255)",
          fontWeight: 600,
        }}>
          <img
            src="/insiight-icon-wh.svg"
            alt="Insiight"
            style={{
              width: 16,
              height: 16,
              opacity: 1,
            }}
          />
          Powered by Insiight
        </div>
      </div>

      {/* Slide body */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}
