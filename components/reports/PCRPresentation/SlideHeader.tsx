"use client";

import { OrgTheme } from "./types";

interface SlideHeaderProps {
  theme: OrgTheme;
  reportDate: string;
}

export default function SlideHeader({ theme, reportDate }: SlideHeaderProps) {
  const formattedDate = new Date(reportDate).toLocaleDateString("en-AU", {
    day: "numeric", month: "short", year: "numeric"
  });

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "2.4% 3.5%",
      flexShrink: 0,
    }}>
      <div style={{
        fontSize: 14,
        color: "rgba(255,255,255,0.7)",
        fontWeight: 600,
        letterSpacing: "0.02em",
      }}>
        POST-CAMPAIGN REPORT
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        fontSize: 14,
        color: "rgba(255,255,255,0.7)",
        fontWeight: 600,
      }}>
        <img
          src="/insiight-icon-wh.svg"
          alt="Insiight"
          style={{ width: 16, height: 16, opacity: 1 }}
        />
        Powered by Insiight
      </div>
    </div>
  );
}
