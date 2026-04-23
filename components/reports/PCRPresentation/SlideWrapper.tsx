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

  const formattedDate = new Date(reportDate).toLocaleDateString("en-AU", {
    day: "numeric", month: "short", year: "numeric"
  });

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: bg,
      display: "flex",
      flexDirection: "column",
      fontFamily: theme.font_family ?? "-apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Header bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.6% 3.5%",
        borderBottom: `1px solid rgba(255,255,255,0.08)`,
        flexShrink: 0,
      }}>
        {/* Left — slide label or report title */}
        {headerLabel && label ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: "clamp(8px, 1vw, 11px)",
            color: primary, fontWeight: 600,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: primary, flexShrink: 0,
            }} />
            {label}
          </div>
        ) : (
          <div style={{
            fontSize: "clamp(8px, 1vw, 11px)",
            color: "rgba(255,255,255,0.3)",
            fontWeight: 500,
          }}>
            Post-Campaign Report
          </div>
        )}

        {/* Centre — date */}
        <div style={{
          fontSize: "clamp(8px, 1vw, 11px)",
          color: "rgba(255,255,255,0.25)",
        }}>
          {formattedDate}
        </div>

        {/* Right — Powered by Insiight */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          fontSize: "clamp(8px, 1vw, 11px)",
          color: "rgba(255,255,255,0.3)",
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1" width="10" height="10" rx="2"
              stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
            <path d="M4 6h4M6 4v4" stroke="rgba(255,255,255,0.3)"
              strokeWidth="1" strokeLinecap="round"/>
          </svg>
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
