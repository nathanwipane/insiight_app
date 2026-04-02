"use client";

import { useState, useEffect } from "react";

type AuthHeadingProps = {
  path: string;
  title: string;
  subtitle: string;
};

export default function AuthHeading({ path, title, subtitle }: AuthHeadingProps) {
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Terminal breadcrumb */}
      <div style={{
        fontSize: 10,
        color: "var(--color-text-muted)",
        letterSpacing: "0.08em",
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}>
        <span style={{ color: "var(--color-primary)" }}>›</span>
        <span>{path}</span>
        <span style={{ color: "var(--color-border)" }}>—</span>
        <span>workspace</span>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 19,
        fontWeight: 600,
        color: "var(--color-text)",
        marginBottom: 6,
        letterSpacing: "-0.02em",
        lineHeight: 1.3,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}>
        {title}
        <span
          className="cursor-blink"
          style={{ marginLeft: 2 }}
          aria-hidden="true"
        >_</span>
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: 12,
        color: "var(--color-text-muted)",
        lineHeight: 1.55,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}>
        {subtitle}
      </p>
    </div>
  );
}