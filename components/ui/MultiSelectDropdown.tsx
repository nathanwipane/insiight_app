"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface MultiSelectGroup {
  label: string;
  options: { value: string; label: string; disabled?: boolean }[];
}

interface MultiSelectDropdownProps {
  groups: MultiSelectGroup[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  width?: number | string;
}

export default function MultiSelectDropdown({
  groups,
  selected,
  onChange,
  placeholder = "Select...",
  width = 220,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const allOptions = groups.flatMap(g => g.options);
  const selectedLabels = selected
    .map(v => allOptions.find(o => o.value === v)?.label)
    .filter(Boolean);

  const triggerLabel = selectedLabels.length === 0
    ? placeholder
    : selectedLabels.length === 1
      ? selectedLabels[0]
      : `${selectedLabels.length} selected`;

  return (
    <div ref={ref} style={{ position: "relative", width, flexShrink: 0 }}>

      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%",
          height: 30,
          padding: "0 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          fontSize: 12,
          color: "var(--color-text)",
          background: "var(--color-surface-alt)",
          border: "1px solid var(--color-border)",
          borderRadius: 6,
          cursor: "pointer",
          outline: "none",
          whiteSpace: "nowrap",
          fontFamily: "inherit",
        }}
      >
        <span style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {triggerLabel}
        </span>
        <ChevronDown
          size={12}
          style={{
            color: "var(--color-text-secondary)",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          minWidth: "100%",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          zIndex: 200,
          overflow: "hidden",
          padding: "4px 0",
        }}>
          {groups.map((group, gi) => (
            <div key={group.label}>
              {/* Group header */}
              <div style={{
                padding: "6px 12px 4px 12px",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
                marginTop: gi > 0 ? 4 : 0,
                borderTop: gi > 0 ? "1px solid var(--color-border)" : "none",
              }}>
                {group.label}
              </div>

              {/* Options */}
              {group.options.map(opt => {
                const isActive = selected.includes(opt.value);
                const isDisabled = !!opt.disabled;
                return (
                  <div
                    key={opt.value}
                    onClick={() => { if (!isDisabled) toggle(opt.value); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "7px 12px",
                      fontSize: 13,
                      color: isDisabled
                        ? "var(--color-text-muted)"
                        : isActive
                          ? "var(--color-text)"
                          : "var(--color-text-secondary)",
                      fontWeight: isActive ? 500 : 400,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      opacity: isDisabled ? 0.5 : 1,
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => {
                      if (!isDisabled) {
                        e.currentTarget.style.background = "var(--color-surface-alt)";
                      }
                    }}
                    onMouseLeave={e =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      border: `1px solid ${isActive ? "var(--color-text)" : "var(--color-border)"}`,
                      background: isActive ? "var(--color-text)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.1s",
                    }}>
                      {isActive && (
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                          <path
                            d="M1.5 4.5L3.5 6.5L7.5 2.5"
                            stroke="var(--color-surface)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {opt.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Clear all */}
          {selected.length > 0 && (
            <div
              onClick={() => { onChange([]); setOpen(false); }}
              style={{
                padding: "6px 12px",
                fontSize: 11,
                color: "var(--color-text-muted)",
                cursor: "pointer",
                borderTop: "1px solid var(--color-border)",
                marginTop: 4,
                textAlign: "center",
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.background = "var(--color-surface-alt)")
              }
              onMouseLeave={e =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              Clear all
            </div>
          )}
        </div>
      )}
    </div>
  );
}
