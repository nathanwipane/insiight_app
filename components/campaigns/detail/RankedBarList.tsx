"use client";

interface RankedBarItem {
  label: string;
  sublabel?: string;   // e.g. category name for over-indexed audiences
  value: number;       // raw value for bar width calculation
  displayValue: string; // formatted string shown on right
  suffix?: string;     // e.g. "%" appended after displayValue
  rightTag?: string;   // e.g. "+21%" delta shown on far right in green
}

interface RankedBarListProps {
  items: RankedBarItem[];
  maxValue?: number;           // defaults to items[0].value
  showRank?: boolean;          // show 1, 2, 3... on left
  rankStartLabel?: string;     // override rank with a fixed label (e.g. "Female")
  labelWidth?: number;         // fixed width for left label (when using rankStartLabel)
  barColor?: string;           // defaults to graduated dark/mid/muted
  graduated?: boolean;         // if true, top=dark, 2-3=mid, rest=muted
}

const DARK  = "var(--color-text)";
const MID   = "var(--color-text-secondary)";
const MUTED = "var(--color-text-muted)";

export default function RankedBarList({
  items,
  maxValue,
  showRank = true,
  labelWidth,
  barColor,
  graduated = true,
}: RankedBarListProps) {
  const max = maxValue ?? (items[0]?.value || 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => {
        const pct   = Math.min((item.value / max) * 100, 100);
        const color = barColor ?? (graduated
          ? i === 0 ? DARK : i < 3 ? MID : MUTED
          : DARK);

        return (
          <div key={item.label + i} style={{ display: "flex", alignItems: "center", gap: 10 }}>

            {/* Bar + labels */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
                  {item.label}
                  {item.sublabel && (
                    <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}> · {item.sublabel}</span>
                  )}
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text)", flexShrink: 0 }}>
                  {item.displayValue}{item.suffix}
                </span>
              </div>
              <div style={{ height: 6, background: "var(--color-border-subtle)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99 }} />
              </div>
            </div>

            {/* Right tag (delta) */}
            {item.rightTag && (
              <span style={{
                fontSize: 10,
                fontWeight: 500,
                color: "var(--status-active-text)",
                flexShrink: 0,
                width: 36,
                textAlign: "right",
              }}>
                {item.rightTag}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Named export of the item type so tabs can import it ───────────────────────
export type { RankedBarItem };