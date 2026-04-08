import VersionLabel from "@/components/shared/VersionLabel";

const METRICS = [
  { label: "impressions",      value: "2,871,920", delta: "+12.4%" },
  { label: "unique_reach",     value: "437,961",   delta: "+8.1%"  },
  { label: "avg_frequency",    value: "6.56",      delta: "+0.81×" },
  { label: "completion_rate",  value: "94.2%",     delta: "+2.3%"  },
  { label: "active_campaigns", value: "12",        delta: "live"   },
  { label: "markets_covered",  value: "5",         delta: "cities" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen"
      style={{ fontFamily: "var(--font-mono)", background: "var(--color-bg)" }}
    >

      {/* ── Left — form panel ── */}
      <div
        className="flex flex-col justify-between w-1/2 shrink-0"
        style={{
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
          padding: "36px 52px",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div style={{
            width: 22, height: 22,
            background: "var(--color-text)",
            borderRadius: "var(--brand-radius-sm)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 7, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px",
          }}>
            IN
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text)", letterSpacing: "0.04em" }}>
            INSIIGHT
          </span>
          <span style={{
            marginLeft: 6, fontSize: 9, color: "var(--color-text-muted)",
            background: "var(--color-surface-alt)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--brand-radius-sm)",
            padding: "1px 5px", letterSpacing: "0.06em",
          }}>
            v2.1.0
          </span>
        </div>

        {/* Form slot */}
        <div style={{ width: "100%", maxWidth: 320, margin: "0 auto" }}>
          {children}
        </div>

        {/* Footer spacer */}
        <div />
      </div>

      {/* ── Right — data panel ── */}
      <div
        className="flex flex-col justify-center w-1/2 shrink-0"
        style={{ background: "var(--color-bg)", padding: "36px 52px", overflow: "hidden" }}
      >
        {/* Tag */}
        <div style={{ marginBottom: 24 }}>
          <VersionLabel label="INSIIGHT / ANALYTICS / v2.1" />
        </div>

        <h2 style={{
          fontSize: 28, fontWeight: 400, color: "var(--color-text)",
          lineHeight: 1.25, letterSpacing: "-0.03em", marginBottom: 12,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>
          Intelligent analytics<br />
          <span style={{ color: "var(--color-text-muted)" }}>for out-of-home media.</span>
        </h2>

        <p style={{
          fontSize: 12, color: "var(--color-text-muted)",
          lineHeight: 1.65, marginBottom: 36, maxWidth: 320,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>
          Audience insights, campaign performance, and creative intelligence — built for modern OOH teams.
        </p>

        {/* Metrics card */}
        <div style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--brand-radius-lg)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "8px 14px",
            borderBottom: "1px solid var(--color-border-subtle)",
            display: "flex", alignItems: "center", gap: 6,
            background: "var(--color-surface-alt)",
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-success)" }} />
            <span style={{ fontSize: 9, color: "var(--color-text-muted)", letterSpacing: "0.08em" }}>
              campaign_summary — live
            </span>
          </div>
          <div>
            {METRICS.map((m, i) => (
              <div
                key={m.label}
                className={i % 2 === 0 ? "metric-row-even" : "metric-row-odd"}
                style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between", padding: "5px 14px",
                }}
              >
                <span style={{ fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.04em" }}>
                  {m.label}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)" }}>
                    {m.value}
                  </span>
                  <span style={{
                    fontSize: 9, color: "var(--color-primary)",
                    background: "var(--color-primary-subtle)",
                    borderRadius: "var(--brand-radius-sm)",
                    padding: "1px 5px", letterSpacing: "0.04em",
                  }}>
                    {m.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}