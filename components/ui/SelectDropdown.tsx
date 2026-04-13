// ––––––––––– components/ui/SelectDropdown.tsx –––––––––––
"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  width?: number | string;
}

export default function SelectDropdown({
  value,
  onChange,
  options,
  placeholder = "Select...",
  width = 160,
}: SelectDropdownProps) {
  const [open, setOpen]         = useState(false);
  const [hovered, setHovered]   = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", width, flexShrink: 0 }}>

      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", height: 30,
          padding: "0 10px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
          fontSize: 12,
          color: "var(--color-text)",
          background: "var(--color-surface-alt)",
          border: "1px solid var(--color-border)",
          borderRadius: 6,
          cursor: "pointer",
          outline: "none",
          whiteSpace: "nowrap",
        }}
      >
        <span>{selected?.label ?? placeholder}</span>
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

      {/* ── Dropdown ── */}
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
          zIndex: 100,
          overflow: "hidden",
          padding: "4px 0",
        }}>
          {options.map(opt => {
            const isActive  = opt.value === value;
            const isHovered = opt.value === hovered;
            return (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                onMouseEnter={() => setHovered(opt.value)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "flex", alignItems: "center",
                  padding: "7px 12px 7px 32px",
                  fontSize: 13,
                  color: isActive ? "var(--color-text)" : "var(--color-text-secondary)",
                  fontWeight: isActive ? 500 : 400,
                  cursor: "pointer",
                  background: isHovered ? "var(--color-surface-alt)" : "transparent",
                  position: "relative",
                  transition: "background 0.1s",
                }}
              >
                {isActive && (
                  <Check
                    size={12}
                    style={{ position: "absolute", left: 10, color: "var(--color-text)", flexShrink: 0 }}
                  />
                )}
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}