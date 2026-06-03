"use client";

import { useEffect, useRef } from "react";
import { LeagueMapZone } from "@/components/leagues/league-map-zone";
import { Map, type MapRef } from "@/components/ui/map";
import type { LeagueProfile } from "@/lib/data/league-profile";
import type { getLeagueMapLocation } from "@/lib/football/league-country-map";

const MAP_FLY_MS = 1100;

type LeagueMapPaneProps = {
  league: LeagueProfile;
  location: ReturnType<typeof getLeagueMapLocation>;
};

export function LeagueMapPane({ league, location }: LeagueMapPaneProps) {
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const timer = window.setTimeout(() => {
      map.resize();
      map.flyTo({
        center: [location.longitude, location.latitude],
        zoom: location.zoom,
        duration: MAP_FLY_MS,
        essential: true,
      });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [league.id, location.latitude, location.longitude, location.zoom]);

  return (
    <div className="absolute inset-0">
      <Map
        ref={mapRef}
        theme="light"
        center={[location.longitude, location.latitude]}
        zoom={location.zoom}
        minZoom={1}
        maxZoom={10}
        attributionControl={false}
        dragPan={false}
        scrollZoom={false}
        doubleClickZoom={false}
        touchZoomRotate={false}
        keyboard={false}
        boxZoom={false}
        className="h-full w-full saturate-[0.85] contrast-[0.98]"
      >
        <LeagueMapZone location={location} country={league.country} live={league.liveMatches > 0} />
      </Map>
    </div>
  );
}
