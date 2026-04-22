"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import Button from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: number;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function Modal({
  open,
  onClose,
  title,
  maxWidth = 640,
  children,
  actions,
}: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "var(--color-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          width: "100%",
          maxWidth,
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: "1px solid var(--color-border)",
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text)",
            }}>
              {title}
            </span>
            <button
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28, height: 28,
                borderRadius: 6,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "var(--color-text-muted)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--color-border-subtle)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {children}
        </div>

        {/* Footer actions */}
        {actions && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 8,
            padding: "12px 20px",
            borderTop: "1px solid var(--color-border)",
            flexShrink: 0,
          }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
