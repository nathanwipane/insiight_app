"use client";

import { useState, useMemo } from "react";
import Map, { Source, Layer, Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type {
  LineLayerSpecification,
  SymbolLayerSpecification,
} from "mapbox-gl";

type LineLayer = Omit<LineLayerSpecification, "source">;
type SymbolLayer = Omit<SymbolLayerSpecification, "source">;

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface PathPoint {
  lat: number;
  lon: number;
  seq: number;
  count: number;
}

interface AssetPath {
  asset_id: string;
  play_date: string;
  point_count: number;
  points: PathPoint[];
}

interface RouteMapProps {
  data: AssetPath[];
  selectedAsset?: string | null;
}

const ORANGE_DOT_THRESHOLD = 60;

const LINE_COLOR   = "#22c55e";
const GREEN_COLOR  = "#22c55e";
const ORANGE_COLOR = "#f97316";

export default function RouteMap({ data, selectedAsset }: RouteMapProps) {
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; assetId: string } | null>(null);

  // Build GeoJSON for route lines
  const linesGeoJSON = useMemo(() => {
    const features = data.map(asset => ({
      type: "Feature" as const,
      properties: { asset_id: asset.asset_id },
      geometry: {
        type: "LineString" as const,
        coordinates: asset.points
          .sort((a, b) => a.seq - b.seq)
          .map(p => [p.lon, p.lat]),
      },
    }));
    return { type: "FeatureCollection" as const, features };
  }, [data]);

  // Build GeoJSON for directional arrows
  const arrowsGeoJSON = useMemo(() => {
    const features: any[] = [];
    data.forEach(asset => {
      const sorted = [...asset.points].sort((a, b) => a.seq - b.seq);
      // Arrow after every dense point
      sorted.forEach((pt, i) => {
        if (pt.count >= 12 && i < sorted.length - 1) {
          const next = sorted[i + 1];
          const bearing = Math.atan2(
            next.lon - pt.lon,
            next.lat - pt.lat
          ) * (180 / Math.PI);
          features.push({
            type: "Feature" as const,
            properties: { bearing },
            geometry: {
              type: "Point" as const,
              coordinates: [pt.lon, pt.lat],
            },
          });
        }
      });
    });
    return { type: "FeatureCollection" as const, features };
  }, [data]);

  // Significant dots (green and orange markers)
  const dots = useMemo(() => {
    const result: { lon: number; lat: number; color: string; assetId: string }[] = [];

    data.forEach(asset => {
      const sorted = [...asset.points].sort((a, b) => a.seq - b.seq);
      if (sorted.length === 0) return;

      // First and last points — green
      const first = sorted[0];
      const last = sorted[sorted.length - 1];

      result.push({
        lon: first.lon, lat: first.lat,
        color: GREEN_COLOR, assetId: asset.asset_id
      });

      // Only add last if different from first
      if (sorted.length > 1) {
        result.push({
          lon: last.lon, lat: last.lat,
          color: GREEN_COLOR, assetId: asset.asset_id
        });
      }

      // Orange dots for count >= ORANGE_DOT_THRESHOLD
      // Skip if it's already the first or last point
      sorted.forEach((pt, i) => {
        if (i === 0 || i === sorted.length - 1) return;
        if (pt.count >= ORANGE_DOT_THRESHOLD) {
          result.push({
            lon: pt.lon, lat: pt.lat,
            color: ORANGE_COLOR, assetId: asset.asset_id
          });
        }
      });
    });

    return result;
  }, [data]);

  // Initial view centred on first point
  const initialView = useMemo(() => {
    const first = data[0]?.points[0];
    return {
      longitude: first?.lon ?? 115.8613,
      latitude: first?.lat ?? -31.9523,
      zoom: 12,
    };
  }, [data]);

  const lineLayer: LineLayer = {
    id: "route-line",
    type: "line",
    paint: {
      "line-color": LINE_COLOR,
      "line-width": 2,
      "line-dasharray": [2, 2],
    },
  };

  const arrowLayer: SymbolLayer = {
    id: "route-arrows",
    type: "symbol",
    layout: {
      "symbol-placement": "point",
      "icon-image": "triangle-stroked-11",
      "icon-rotate": ["get", "bearing"],
      "icon-rotation-alignment": "map",
      "icon-size": 1,
      "icon-allow-overlap": true,
    },
    paint: {
      "icon-color": LINE_COLOR,
    },
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div style={{
        width: "100%", height: "100%",
        display: "flex", alignItems: "center",
        justifyContent: "center",
        fontSize: 12, color: "rgba(255,255,255,0.3)",
        background: "#1a1f2e",
      }}>
        Map unavailable — set NEXT_PUBLIC_MAPBOX_TOKEN
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{
        width: "100%", height: "100%",
        display: "flex", alignItems: "center",
        justifyContent: "center",
        fontSize: 12, color: "rgba(255,255,255,0.3)",
        background: "#1a1f2e",
      }}>
        No route data for selected date
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Map
        initialViewState={initialView}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        reuseMaps
      >
        {/* Route lines */}
        <Source id="route-lines" type="geojson" data={linesGeoJSON}>
          <Layer {...lineLayer} />
        </Source>

        {/* Direction arrows */}
        <Source id="route-arrows" type="geojson" data={arrowsGeoJSON}>
          <Layer {...arrowLayer} />
        </Source>

        {/* Significant dots */}
        {dots.map((dot, i) => (
          <Marker
            key={i}
            longitude={dot.lon}
            latitude={dot.lat}
            anchor="center"
          >
            <div style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: dot.color,

              cursor: "pointer",
            }}
            title={dot.assetId}
            />
          </Marker>
        ))}
      </Map>

      {/* Legend */}
      <div style={{
        position: "absolute",
        top: 12, right: 12,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        borderRadius: 8,
        padding: "10px 12px",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 2,
        }}>
          Path
        </div>
        {[
          { color: GREEN_COLOR,  label: "Start / End" },
          { color: ORANGE_COLOR, label: `Stopped (> 10 min)` },
        ].map(({ color, label }) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{
              width: 10, height: 10,
              borderRadius: "50%",
              background: color,
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.6)",
            }}>
              {label}
            </span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 20, height: 2,
            background: `repeating-linear-gradient(to right, ${LINE_COLOR} 0px, ${LINE_COLOR} 4px, transparent 4px, transparent 8px)`,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Route</span>
        </div>
      </div>

      {/* Mapbox attribution */}
      <div style={{
        position: "absolute", bottom: 6, left: 12,
        fontSize: 9, color: "rgba(255,255,255,0.3)",
      }}>
        © Mapbox · Insiight
      </div>
    </div>
  );
}
