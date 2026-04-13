// ––––––––––– components/campaigns/CampaignsTableSkeleton.tsx –––––––––––
"use client";

const COLUMNS = [
  { label: "Campaign",    width: "27%" },
  { label: "Status",      width: "10%" },
  { label: "Client",      width: "16%" },
  { label: "Progress",    width: "20%" },
  { label: "Impressions", width: "11%" },
  { label: "Period",      width: "10%" },
  { label: "",            width: "6%"  },
];

export default function CampaignsTableSkeleton() {
  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--brand-radius-lg)",
      overflow: "hidden",
    }}>
      {/* Header row */}
      <div style={{
        display: "flex",
        padding: "10px 0",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface-alt)",
      }}>
        {COLUMNS.map((col, i) => (
          <div key={i} style={{ width: col.width, padding: "0 14px", flexShrink: 0 }}>
            {col.label && (
              <div style={{
                height: 10, width: "60%",
                background: "var(--color-border)",
                borderRadius: 4,
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Skeleton rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            padding: "13px 0",
            borderBottom: i < 4 ? "1px solid var(--color-border)" : "none",
          }}
        >
          {/* Campaign name + id */}
          <div style={{ width: "27%", padding: "0 14px", display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ height: 11, width: "70%", background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 9,  width: "45%", background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite", opacity: 0.6 }} />
          </div>
          {/* Status badge */}
          <div style={{ width: "10%", padding: "0 14px" }}>
            <div style={{ height: 20, width: 70, background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
          {/* Client */}
          <div style={{ width: "16%", padding: "0 14px" }}>
            <div style={{ height: 11, width: "65%", background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
          {/* Progress */}
          <div style={{ width: "20%", padding: "0 14px", display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ height: 9,  width: "50%", background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 3,  width: "80%", background: "var(--color-border)", borderRadius: 99,  animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
          {/* Impressions */}
          <div style={{ width: "11%", padding: "0 14px" }}>
            <div style={{ height: 11, width: "55%", background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
          {/* Period */}
          <div style={{ width: "10%", padding: "0 14px", display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ height: 9, width: "60%", background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 9, width: "50%", background: "var(--color-border)", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite", opacity: 0.6 }} />
          </div>
          {/* Actions */}
          <div style={{ width: "6%", padding: "0 14px", display: "flex", gap: 6 }}>
            <div style={{ height: 28, width: 28, background: "var(--color-border)", borderRadius: 6, animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 28, width: 28, background: "var(--color-border)", borderRadius: 6, animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
        </div>
      ))}
    </div>
  );
}