"use client";

interface AustraliaMapProps {
  regions: string[];
  primary?: string;
}

const CITY_POSITIONS: Record<string, { x: number; y: number; label: string }> = {
  WA:  { x: 218, y: 492, label: "Perth" },
  NT:  { x: 485, y: 25, label: "Darwin" },
  QLD: { x: 940, y: 388, label: "Brisbane" },
  SA:  { x: 648, y: 541, label: "Adelaide" },
  NSW: { x: 885, y: 532, label: "Sydney" },
  VIC: { x: 760, y: 610, label: "Melbourne" },
  TAS: { x: 785, y: 715, label: "Hobart" },
  ACT: { x: 842, y: 558, label: "Canberra" },
};

function normaliseRegion(region: string): string {
  const r = region.toUpperCase().trim();
  if (r.includes("WEST") || r === "WA") return "WA";
  if ((r.includes("NORTH") && r.includes("TERR")) || r === "NT") return "NT";
  if (r.includes("QUEENS") || r === "QLD") return "QLD";
  if (r.includes("SOUTH AUS") || r === "SA") return "SA";
  if (r.includes("NEW SOUTH") || r === "NSW") return "NSW";
  if (r.includes("VICTOR") || r === "VIC") return "VIC";
  if (r.includes("TAS")) return "TAS";
  if (r.includes("CAPITAL") || r === "ACT") return "ACT";
  return r;
}

export default function AustraliaMap({ regions, primary = "#95bbc1" }: AustraliaMapProps) {
  const normalisedRegions = regions.map(normaliseRegion);
  const dots = Object.entries(CITY_POSITIONS).filter(([key]) =>
    normalisedRegions.includes(key)
  );

  // Fallback to WA if no match
  const activeDots = dots.length > 0
    ? dots
    : [["WA", CITY_POSITIONS.WA] as [string, typeof CITY_POSITIONS.WA]];

  const r = parseInt(primary.slice(1, 3), 16);
  const g = parseInt(primary.slice(3, 5), 16);
  const b = parseInt(primary.slice(5, 7), 16);
  const rgba = (a: number) => `rgba(${r},${g},${b},${a})`;

  return (
    <div style={{
      width: "100%",
      height: "100%",
      position: "relative",
      overflow: "hidden",
      borderRadius: "inherit",
    }}>
      {/* Base map image */}
      <img
        src="/mapAUS.png"
        alt="Australia map"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
        }}
      />

      {/* SVG overlay for beacons — same dimensions as image */}
      <svg
        viewBox="0 0 1164 699"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>{`
            @keyframes beacon-pulse {
              0%, 100% { r: 50; opacity: 0.12; }
              50% { r: 65; opacity: 0.04; }
            }
            @keyframes beacon-mid {
              0%, 100% { r: 32; opacity: 0.25; }
              50% { r: 42; opacity: 0.08; }
            }
            .b-outer { animation: beacon-pulse 4.5s ease-in-out infinite; }
            .b-mid { animation: beacon-mid 4.5s ease-in-out infinite; }
          `}</style>
        </defs>

        {activeDots.map(([key, pos]) => (
          <g key={key}>
            <circle
              className="b-outer"
              cx={pos.x}
              cy={pos.y}
              r={34}
              fill={rgba(0.7)}
            />
            <circle
              className="b-mid"
              cx={pos.x}
              cy={pos.y}
              r={24}
              fill={rgba(0.85)}
            />
            <circle
              cx={pos.x}
              cy={pos.y}
              r={14}
              fill={primary}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
