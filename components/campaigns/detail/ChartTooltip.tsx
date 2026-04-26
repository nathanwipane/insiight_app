"use client";

interface TooltipRow {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
  indicator?: "dot" | "line";
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  title?: string;
  rows?: TooltipRow[];
  formatter?: (payload: any[]) => TooltipRow[];
}

export default function ChartTooltip({
  active,
  payload,
  label,
  title,
  rows,
  formatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const displayRows: TooltipRow[] = formatter
    ? formatter(payload)
    : rows ?? payload.map(p => ({
        label: p.name,
        value: p.value?.toLocaleString() ?? "",
        color: p.color,
      }));

  return (
    <div style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 12,
      minWidth: 160,
    }}>
      {(title ?? label) && (
        <div style={{
          fontWeight: 600,
          color: "var(--color-text)",
          marginBottom: displayRows.length ? 6 : 0,
          fontSize: 13,
        }}>
          {title ?? label}
        </div>
      )}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}>
        {displayRows.map((row, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              {row.color && (
                row.indicator === "line" ? (
                  <div style={{
                    width: 12,
                    height: 2,
                    borderRadius: 1,
                    background: row.color,
                    flexShrink: 0,
                  }} />
                ) : (
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: row.color,
                    flexShrink: 0,
                  }} />
                )
              )}
              <span style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
              }}>
                {row.label}
              </span>
            </div>
            <span style={{
              fontSize: 12,
              fontWeight: row.bold ? 600 : 500,
              color: "var(--color-text)",
            }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
