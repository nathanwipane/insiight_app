"use client";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    color: "var(--color-surface)",
    background: "var(--color-text)",
    border: "none",
  },
  secondary: {
    color: "var(--color-text-secondary)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
  },
  ghost: {
    color: "var(--color-text-secondary)",
    background: "transparent",
    border: "none",
  },
};

const SIZES: Record<ButtonSize, React.CSSProperties> = {
  sm: { height: 28, padding: "0 10px", fontSize: 11, borderRadius: 6 },
  md: { height: 32, padding: "0 14px", fontSize: 12, borderRadius: 7 },
};

export default function Button({
  variant = "secondary",
  size = "md",
  children,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontWeight: 500,
        cursor: "pointer",
        flexShrink: 0,
        transition: "opacity 0.15s",
        ...STYLES[variant],
        ...SIZES[size],
        ...style,
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      {...props}
    >
      {children}
    </button>
  );
}
