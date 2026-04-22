"use client";

import React from "react";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, subtitle, action }: EmptyStateProps) {
  return (
    <div style={{
      padding: "48px 24px",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
    }}>
      <div style={{
        fontSize: 13,
        fontWeight: 500,
        color: "var(--color-text)",
      }}>
        {title}
      </div>
      {subtitle && (
        <div style={{
          fontSize: 12,
          color: "var(--color-text-secondary)",
          maxWidth: 320,
        }}>
          {subtitle}
        </div>
      )}
      {action && (
        <div style={{ marginTop: 8 }}>
          {action}
        </div>
      )}
    </div>
  );
}
