"use client";

import { useMemo } from "react";
import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { DeckGL } from "@deck.gl/react";
import { H3HexagonLayer } from "@deck.gl/geo-layers";
import * as h3 from "h3-js";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const INITIAL_VIEW_STATE = {
  longitude: 115.8613,
  latitude: -31.9523,
  zoom: 9,
  pitch: 0,
  bearing: 0,
};

interface HeatmapRow {
  h3_cell: string;
  total_impressions: number;
  total_ad_plays: number;
}

interface ProcessedHex {
  hex_id: string;
  lat: number;
  lng: number;
  total_impressions: number;
}

interface HexMapProps {
  data: HeatmapRow[];
  primary?: string;
}

function processData(raw: HeatmapRow[]): ProcessedHex[] {
  return raw
    .map(row => {
      try {
        const [lat, lng] = h3.cellToLatLng(row.h3_cell);
        return {
          hex_id: row.h3_cell,
          lat,
          lng,
          total_impressions: row.total_impressions,
        };
      } catch {
        return null;
      }
    })
    .filter((d): d is ProcessedHex => d !== null);
}

function getColor(value: number, max: number): [number, number, number, number] {
  const ratio = Math.pow(Math.min(1, value / (max || 1)), 0.5);

  if (ratio < 0.25) {
    // Deep teal → green
    const t = ratio / 0.25;
    return [
      Math.round(30 + t * 50),
      Math.round(180 + t * 40),
      Math.round(120 - t * 40),
      150,
    ];
  } else if (ratio < 0.55) {
    // Green → yellow-green
    const t = (ratio - 0.25) / 0.30;
    return [
      Math.round(80 + t * 175),
      Math.round(220 - t * 20),
      Math.round(80 - t * 60),
      150,
    ];
  } else if (ratio < 0.80) {
    // Yellow → orange
    const t = (ratio - 0.55) / 0.25;
    return [
      255,
      Math.round(200 - t * 120),
      Math.round(20 - t * 20),
      150,
    ];
  } else {
    // Orange → deep red
    const t = (ratio - 0.80) / 0.20;
    return [
      255,
      Math.round(80 - t * 60),
      0,
      150,
    ];
  }
}

export default function HexMap({ data, primary = "#95bbc1" }: HexMapProps) {
  const processed = useMemo(() => processData(data), [data]);

  const maxImpressions = useMemo(
    () => Math.max(...processed.map(d => d.total_impressions), 1),
    [processed]
  );

  const viewState = useMemo(() => {
    if (processed.length === 0) return INITIAL_VIEW_STATE;
    const top = processed.reduce((a, b) =>
      b.total_impressions > a.total_impressions ? b : a
    );
    return {
      longitude: top.lng,
      latitude: top.lat,
      zoom: 9,
      pitch: 0,
      bearing: 0,
    };
  }, [processed]);

  const layers = useMemo(() => {
    if (processed.length === 0) return [];
    return [
      new H3HexagonLayer({
        id: "hex-layer",
        data: processed,
        pickable: true,
        filled: true,
        extruded: false,
        wireframe: false,
        getHexagon: (d: ProcessedHex) => d.hex_id,
        getFillColor: (d: ProcessedHex) => getColor(d.total_impressions, maxImpressions),
        coverage: 0.85,
        updateTriggers: {
          getFillColor: [maxImpressions],
        },
      }),
    ];
  }, [processed, maxImpressions]);

  // Legend
  const legendItems = useMemo(() => {
    return [0.1, 0.35, 0.65, 1].map(r => {
      const v = Math.round(r * maxImpressions);
      const c = getColor(v, maxImpressions);
      return {
        color: `rgba(${c[0]},${c[1]},${c[2]},${(c[3] / 255).toFixed(2)})`,
        label: v.toLocaleString(),
      };
    });
  }, [maxImpressions]);

  if (!MAPBOX_TOKEN) {
    return (
      <div style={{
        width: "100%", height: "100%",
        display: "flex", alignItems: "center",
        justifyContent: "center",
        fontSize: 12, color: "rgba(255,255,255,0.2)",
      }}>
        Map unavailable — set NEXT_PUBLIC_MAPBOX_TOKEN
      </div>
    );
  }

  if (processed.length === 0) {
    return (
      <div style={{
        width: "100%", height: "100%",
        display: "flex", alignItems: "center",
        justifyContent: "center",
        fontSize: 12, color: "rgba(255,255,255,0.2)",
      }}>
        No heatmap data available
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <DeckGL
        style={{ width: "100%", height: "100%" }}
        layers={layers}
        initialViewState={viewState}
        controller={true}
        getTooltip={({ object }: any) =>
          object && {
            html: `<div style="font-size:12px;padding:6px 10px;background:#1a1a1a;color:#fff;border-radius:6px;">
              <strong>${object.total_impressions.toLocaleString()}</strong> impressions
            </div>`,
          }
        }
      >
        <Map
          style={{ width: "100%", height: "100%" }}
          reuseMaps
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
        />
      </DeckGL>

      {/* Legend */}
      <div style={{
        position: "absolute",
        top: 12, right: 12,
        background: "rgba(115, 115, 115, 0.65)",
        backdropFilter: "blur(4px)",
        borderRadius: 8,
        padding: "10px 12px",
        zIndex: 10,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 600,
          color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 8,
        }}>
          Impressions
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {legendItems.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{
                width: 14, height: 14,
                borderRadius: 3,
                background: item.color,
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.6)",
              }}>
                {i === legendItems.length - 1 ? `${item.label}+` : item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
