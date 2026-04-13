type VersionLabelProps = {
  label: string;
};

export default function VersionLabel({ label }: VersionLabelProps) {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--brand-radius-sm)",
      padding: "3px 8px",
      width: "fit-content",
    }}>
      <div style={{
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: "var(--color-primary)",
        flexShrink: 0,
      }} />
      <span style={{
        fontSize: 9,
        color: "var(--color-text-muted)",
        letterSpacing: "0.1em",
      }}>
        {label}
      </span>
    </div>
  );
}