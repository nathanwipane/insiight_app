"use client";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div style={{
      background: "var(--color-error-subtle)",
      border: "1px solid var(--color-error-border)",
      borderRadius: 8,
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    }}>
      <span style={{
        fontSize: 12,
        color: "var(--color-error)",
      }}>
        {message}
      </span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "var(--color-error)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
            textDecoration: "underline",
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
