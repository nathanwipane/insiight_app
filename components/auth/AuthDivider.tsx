type AuthDividerProps = {
  label?: string;
};

export default function AuthDivider({ label = "OR" }: AuthDividerProps) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 16,
    }}>
      <div style={{ flex: 1, height: 1, background: "var(--color-border-subtle)" }} />
      <span style={{
        fontSize: 10,
        color: "var(--color-text-disabled)",
        letterSpacing: "0.06em",
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--color-border-subtle)" }} />
    </div>
  );
}