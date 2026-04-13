// ––––––––––– components/campaigns/CampaignStatusBadge.tsx –––––––––––
"use client";

// ── Shared status config — single source of truth ─────────────────
// Used by CampaignStatusBadge AND GanttTimeline
export const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  active:    { label: "Active",    bg: "var(--status-active-bg)",    color: "var(--status-active-text)"    },
  scheduled: { label: "Scheduled", bg: "var(--status-scheduled-bg)", color: "var(--status-scheduled-text)" },
  completed: { label: "Completed", bg: "var(--status-completed-bg)", color: "var(--status-completed-text)" },
  draft:     { label: "Draft",     bg: "var(--status-draft-bg)",     color: "var(--status-draft-text)"     },
};

const DEFAULT: { label: string; bg: string; color: string } = {
  label: "Unknown",
  bg:    "var(--status-draft-bg)",
  color: "var(--status-draft-text)",
};

export default function CampaignStatusBadge({ status }: { status: string }) {
  const s = STATUS_CONFIG[status?.toLowerCase()] ?? DEFAULT;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.color,
      borderRadius: 4, padding: "2px 8px",
      fontSize: 11, fontWeight: 500, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}