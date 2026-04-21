// ––––––––––– components/campaigns/GanttTimeline.tsx –––––––––––
"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { CampaignTypeV2 } from "@/constants/types";
import { STATUS_CONFIG } from "@/components/campaigns/CampaignStatusBadge";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG  = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_LETTERS  = ["S", "M", "T", "W", "T", "F", "S"];

const DAYS_IN_VIEW: Record<string, number> = {
  "1M": 30,
  "6M": 180,
  "1Y": 365,
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function daysBetween(a: Date, b: Date) {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000);
}

interface GanttTimelineProps {
  campaigns: CampaignTypeV2[];
  range?: string;
}

export default function GanttTimeline({ campaigns, range = "1Y" }: GanttTimelineProps) {
  const outerRef  = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    if (!outerRef.current) return;
    const ro = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(outerRef.current);
    return () => ro.disconnect();
  }, []);

  const daysInView = DAYS_IN_VIEW[range] ?? 365;
  const dayWidth   = containerWidth / daysInView;

  const { timelineStart, totalDays } = useMemo(() => {
    const dates = campaigns.flatMap(c => [new Date(c.start_date), new Date(c.end_date)]);
    const earliest = dates.reduce((a, b) => a < b ? a : b, new Date());
    const latest   = dates.reduce((a, b) => a > b ? a : b, new Date());

    // Always start at the 1st of the earliest campaign month
    const start = new Date(earliest.getFullYear(), earliest.getMonth(), 1);

    // End must be at least daysInView days from start so the container fills exactly
    const minEnd    = addDays(start, daysInView);
    // Also ensure we cover all campaign dates (snap to end of that month)
    const dataEnd   = new Date(latest.getFullYear(), latest.getMonth() + 1, 1);
    const end       = dataEnd > minEnd ? dataEnd : minEnd;

    return { timelineStart: start, totalDays: daysBetween(start, end) };
  }, [campaigns, daysInView]);

  const totalWidth = totalDays * dayWidth;

  const days = useMemo(() =>
    Array.from({ length: totalDays }, (_, i) => addDays(timelineStart, i)),
    [timelineStart, totalDays]
  );

  const monthGroups = useMemo(() => {
    const groups: { label: string; startIdx: number; count: number }[] = [];
    let current = "";

    const fmt = (d: Date) => {
      const m = d.getMonth();
      const y = String(d.getFullYear()).slice(2);
      return range === "1M"
        ? `${MONTHS_LONG[m]} 20${y}`
        : `${MONTHS_SHORT[m]} ${y}`;
    };

    days.forEach((d, i) => {
      const key = fmt(d);
      if (key !== current) {
        groups.push({ label: key, startIdx: i, count: 1 });
        current = key;
      } else {
        groups[groups.length - 1].count++;
      }
    });
    return groups;
  }, [days, range]);

  const today       = startOfDay(new Date());
  const todayOffset = daysBetween(timelineStart, today);
  const todayLeft   = todayOffset * dayWidth;

  useEffect(() => {
    if (scrollRef.current && containerWidth > 0) {
      scrollRef.current.scrollLeft = Math.max(0, todayLeft - containerWidth / 2);
    }
  }, [range, todayLeft, containerWidth]);

  const showDayRow    = range === "1M";
  const showDayLetter = range === "1M" && dayWidth >= 24;

  const MONTH_H = 24;
  const DAY_H   = showDayRow ? 22 : 0;

  return (
    // ── Outer: fills parent height via flex ──────────────────────
    <div
      ref={outerRef}
      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}
    >
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowX: "auto", overflowY: "hidden", display: "flex", flexDirection: "column" }}
      >
        <div
          style={{
            width: Math.max(totalWidth, containerWidth),
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Month header */}
          <div style={{ display: "flex", height: MONTH_H, flexShrink: 0 }}>
            {monthGroups.map((g, i) => (
              <div key={i} style={{
                width: g.count * dayWidth, flexShrink: 0,
                padding: "0 6px", display: "flex", alignItems: "center",
                fontSize: range === "1M" ? 11 : 10,
                fontWeight: 500, color: "#374151",
                borderLeft: i > 0 ? "1px solid #e5e7eb" : "none",
                overflow: "hidden", whiteSpace: "nowrap",
              }} title={g.label}>
                {g.label}
              </div>
            ))}
          </div>

          {/* Day row — 1M only */}
          {showDayRow && (
            <div style={{ display: "flex", height: DAY_H, flexShrink: 0 }}>
              {days.map((d, i) => {
                const isToday   = i === todayOffset;
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <div key={i} style={{
                    width: dayWidth, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 2,
                    background: isToday ? "#9333ea" : "transparent",
                    borderRadius: isToday ? 3 : 0,
                  }}>
                    <span style={{ fontSize: 11, fontWeight: isToday ? 700 : 400, color: isToday ? "#fff" : isWeekend ? "#9ca3af" : "#374151", lineHeight: 1 }}>
                      {d.getDate()}
                    </span>
                    {showDayLetter && (
                      <span style={{ fontSize: 11, color: isToday ? "#fff" : isWeekend ? "#9ca3af" : "#6b7280", lineHeight: 1 }}>
                        {DAY_LETTERS[d.getDay()]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Bar area — fills remaining height */}
          <div style={{ flex: 1, position: "relative", paddingTop: 12 }}>

            {/* Month grid lines */}
            {monthGroups.map((g, i) => i > 0 && (
              <div key={i} style={{
                position: "absolute", top: 0, bottom: 0,
                left: g.startIdx * dayWidth,
                width: 1, background: "#f0f0f0",
                pointerEvents: "none",
              }} />
            ))}

            {/* Today line */}
            {todayOffset >= 0 && todayOffset <= totalDays && (
              <div style={{
                position: "absolute", top: 0, bottom: 0,
                left: todayLeft + dayWidth / 2,
                width: 1.5, background: "#9333ea",
                zIndex: 4, pointerEvents: "none",
              }} />
            )}

            {/* Campaign bars */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {campaigns.map(c => {
                const status   = (c.status || "draft").toLowerCase();
                const conf     = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
                const startOff = Math.max(0, daysBetween(timelineStart, new Date(c.start_date)));
                const endOff   = Math.min(totalDays, daysBetween(timelineStart, new Date(c.end_date)));
                const barW     = Math.max((endOff - startOff) * dayWidth, 4);

                return (
                  <div key={c.campaign_id} style={{ position: "relative", height: 28 }}>
                    <div style={{
                      position: "absolute",
                      left: startOff * dayWidth,
                      width: barW, height: "100%",
                      background: conf.bg,
                      borderRadius: 4,
                      border: "none",
                      display: "flex", alignItems: "center",
                      paddingLeft: 8, overflow: "hidden",
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: conf.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {c.campaign_name}{status === "draft" ? " · Draft" : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}