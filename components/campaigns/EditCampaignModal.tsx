"use client";

import { X } from "lucide-react";

interface EditCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId?: string;
  campaignName?: string;
}

export default function EditCampaignModal({ isOpen, onClose, campaignId, campaignName }: EditCampaignModalProps) {
  if (!isOpen) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "var(--color-surface)",
        borderRadius: 12,
        width: 560, maxWidth: "90vw",
        padding: "24px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text)", margin: "0 0 3px" }}>
              Edit Campaign
            </h2>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0 }}>
              {campaignName ?? campaignId}
            </p>
          </div>
          <button onClick={onClose} style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 28, border: "1px solid var(--color-border)",
            borderRadius: 6, background: "transparent",
            color: "var(--color-text-secondary)", cursor: "pointer",
          }}>
            <X size={14} />
          </button>
        </div>
        <div style={{
          height: 200, background: "var(--color-surface-alt)",
          border: "1px solid var(--color-border)", borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, color: "var(--color-text-secondary)",
        }}>
          Edit form coming soon
        </div>
      </div>
    </div>
  );
}
