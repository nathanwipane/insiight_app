"use client";

interface SkeletonProps {
  height?: number | string;
  width?: number | string;
  borderRadius?: number;
  style?: React.CSSProperties;
}

export default function Skeleton({
  height = 20,
  width = "100%",
  borderRadius = 4,
  style,
}: SkeletonProps) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius,
        background: "var(--color-border)",
        animation: "pulse 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export function SkeletonRows({ count = 4, gap = 10 }: { count?: number; gap?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} style={{ opacity: 1 - i * 0.1 }} />
      ))}
    </div>
  );
}
