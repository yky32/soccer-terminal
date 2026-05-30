"use client";

import { useEffect, useId, useMemo } from "react";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import type { GeoJSONSource } from "maplibre-gl";
import { useMap } from "@/components/ui/map";
import type { LeagueMapLocation } from "@/lib/football/league-country-map";
import { createLeagueZonePolygon } from "@/lib/football/league-country-map";
import { getLeagueZoneBoundary } from "@/lib/football/league-zone-boundaries";

type LeagueMapZoneProps = {
  location: LeagueMapLocation;
  country: string;
  live?: boolean;
};

export function LeagueMapZone({ location, country, live = false }: LeagueMapZoneProps) {
  const { map, isLoaded } = useMap();
  const autoId = useId();
  const sourceId = `league-zone-${autoId}`;
  const fillId = `league-zone-fill-${autoId}`;
  const glowId = `league-zone-glow-${autoId}`;
  const lineId = `league-zone-line-${autoId}`;

  const boundary = useMemo(() => getLeagueZoneBoundary(country), [country]);

  const collection = useMemo((): FeatureCollection<Polygon | MultiPolygon> => {
    if (boundary) {
      return {
        type: "FeatureCollection",
        features: [boundary],
      };
    }

    const zone = createLeagueZonePolygon(
      location.longitude,
      location.latitude,
      location.zoneRadiusKm,
    );
    zone.properties = { kind: "zone" };

    return {
      type: "FeatureCollection",
      features: [zone],
    };
  }, [boundary, location.latitude, location.longitude, location.zoneRadiusKm]);

  const fillColor = live ? "#10b981" : "#6366f1";
  const lineColor = live ? "#059669" : "#4f46e5";

  useEffect(() => {
    if (!isLoaded || !map) return;

    map.addSource(sourceId, {
      type: "geojson",
      data: collection,
    });

    map.addLayer({
      id: fillId,
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": fillColor,
        "fill-opacity": boundary ? 0.28 : 0.22,
      },
    });

    map.addLayer({
      id: glowId,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": fillColor,
        "line-width": 7,
        "line-opacity": 0.14,
        "line-blur": 1.25,
      },
    });

    map.addLayer({
      id: lineId,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": lineColor,
        "line-width": 2,
        "line-opacity": 0.62,
      },
    });

    return () => {
      try {
        if (map.getLayer(lineId)) map.removeLayer(lineId);
        if (map.getLayer(glowId)) map.removeLayer(glowId);
        if (map.getLayer(fillId)) map.removeLayer(fillId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // ignore teardown races
      }
    };
  }, [boundary, collection, fillColor, fillId, glowId, isLoaded, lineColor, lineId, map, sourceId]);

  useEffect(() => {
    if (!isLoaded || !map) return;

    const source = map.getSource(sourceId) as GeoJSONSource | undefined;
    source?.setData(collection);
    map.setPaintProperty(fillId, "fill-color", fillColor);
    map.setPaintProperty(glowId, "line-color", fillColor);
    map.setPaintProperty(lineId, "line-color", lineColor);
  }, [collection, fillColor, fillId, glowId, isLoaded, lineColor, lineId, map, sourceId]);

  return null;
}
