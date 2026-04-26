"use client";

interface IndexChartItem {
  label: string;
  index: number;
}

interface IndexChartProps {
  items: IndexChartItem[];
  min?: number;
  max?: number;
}

const DASH_COUNT = 5;
const DASH_GAP_PCT = 1.5; // percent gap between dashes

export default function IndexChart({
  items,
  min = 80,
  max = 300,
}: IndexChartProps) {
  const range = max - min;
  const sorted = [...items].sort((a, b) => b.index - a.index);
  const top = sorted[0];
  const rest = sorted.slice(1);

  const fillPct = (index: number) => {
    const clamped = Math.min(Math.max(index, min), max);
    return ((clamped - min) / range) * 100;
  };

  const trackColor = "var(--color-border)";
  const fillColor = "var(--color-text)";

  const Bar = ({ item }: { item: IndexChartItem }) => {
    const fill = fillPct(item.index);

    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        {/* Pill label */}
        <div style={{
          width: 200,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}>
          <div style={{
            maxWidth: 180,
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontSize: 12,
            fontWeight: 500,
            color: "var(--color-text-secondary)",
            border: "1px solid var(--color-border)",
            borderRadius: 99,
            padding: "2px 10px",
            whiteSpace: "nowrap",
          }}>
            {item.label}
          </div>
        </div>

        <div style={{
          flex: 1,
          position: "relative",
          height: 6,
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}>
          {Array.from({ length: DASH_COUNT }).map((_, di) => {
            const dashStartPct = (di / DASH_COUNT) * 100;
            const dashEndPct = ((di + 1) / DASH_COUNT) * 100;
            const isFilled = fill >= dashEndPct;
            const isPartial = fill > dashStartPct && fill < dashEndPct;
            const partialWidth = isPartial
              ? ((fill - dashStartPct) / (dashEndPct - dashStartPct)) * 100
              : 100;

            return (
              <div key={di} style={{
                flex: 1,
                height: 6,
                borderRadius: 99,
                position: "relative",
                background: "var(--color-border)",
                overflow: "hidden",
              }}>
                {(isFilled || isPartial) && (
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: isFilled ? "100%" : `${partialWidth}%`,
                    borderRadius: 99,
                    background: "linear-gradient(to right, #c163dc, #ad46ff)",
                    backgroundSize: `${DASH_COUNT * 100}%`,
                    backgroundPosition: `${(di / (DASH_COUNT - 1)) * 100}% 0`,
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Score */}
        <div style={{
          width: 32,
          flexShrink: 0,
          fontSize: 14,
          fontWeight: 600,
          background: "linear-gradient(to right, #c163dc, #ad46ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textAlign: "right",
        }}>
          {Math.round(item.index)}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Top item summary */}
      {top && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          paddingBottom: 12,
          borderBottom: "1px solid var(--color-border)",
          marginBottom: 4,
        }}>
          {/* Circle with index score */}
          <svg width="54" height="54" viewBox="0 0 52 52"
            style={{ flexShrink: 0 }}>
            <defs>
              <linearGradient id="indexGradient" x1="0%" y1="0%"
                x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c163dc"/>
                <stop offset="100%" stopColor="#ad46ff"/>
              </linearGradient>
            </defs>
            <circle
              cx="26" cy="26" r="22"
              fill="none"
              stroke="url(#indexGradient)"
              opacity={1}
              strokeWidth="2"
              strokeDasharray="12 3"
              strokeLinecap="round"
            />
            <text
              x="26" y="26"
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fontSize: 16,
                fontWeight: 800,
                fill: "url(#indexGradient)",
                fontFamily: "inherit",
              }}
            >
              {Math.round(top.index)}
            </text>
          </svg>

          {/* Label + description */}
          <div>
            <div style={{
              fontSize: 12,
              color: "var(--color-text)",
              marginBottom: 4,
            }}>
              Top index for your audience
            </div>
            <div style={{
              fontSize: 12,
              fontWeight: 500,
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
              borderRadius: 99,
              padding: "2px 10px",
              display: "inline-block",
            }}>
              {top.label}
            </div>
          </div>
        </div>
      )}

      {/* Label heading */}
      <div style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--color-text)",
        marginBottom: 2,
      }}>
        Top audiences in this area
      </div>

      {/* Bars for all items including top */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map((item, i) => (
          <Bar key={i} item={item} />
        ))}
      </div>
    </div>
  );
}
