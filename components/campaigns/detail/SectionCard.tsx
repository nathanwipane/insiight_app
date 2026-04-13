"use client";

import React from "react";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;        // right-side header slot (buttons, legend, etc.)
  children: React.ReactNode;
  noPadding?: boolean;             // skip padding on body (for tables, maps, charts that bleed to edges)
  bodyStyle?: React.CSSProperties; // extra styles on the body div
  stretchHeight?: boolean;         // make root div fill its parent height
}

export default function SectionCard({
  title,
  subtitle,
  action,
  children,
  noPadding = false,
  bodyStyle,
  stretchHeight = false,
}: SectionCardProps) {
  return (
    <div style={{
      height: stretchHeight ? "100%" : undefined,
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 10,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 20px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface-alt)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <div>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-text)",
          }}>
            {title}
          </div>
          {subtitle && (
            <div style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              marginTop: 2,
            }}>
              {subtitle}
            </div>
          )}
        </div>
        {action && (
          <div style={{ flexShrink: 0 }}>
            {action}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{
        padding: noPadding ? 0 : "16px 20px",
        ...bodyStyle,
      }}>
        {children}
      </div>
    </div>
  );
}