"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { CountryLivePin } from "@/components/overview/country-live-pin";
import { MapLiveStatsCard } from "@/components/overview/map-live-stats-card";
import { Map, type MapRef } from "@/components/ui/map";
import type { CountryMatchActivity } from "@/lib/data/live-match-countries";
import {
  getLiveMatchStats,
  LIVE_MATCH_COUNTRIES,
} from "@/lib/data/live-match-countries";

const TREND_PERCENT = 12.5;
const WORLD_VIEW = { center: [0, 22] as [number, number], zoom: 1.2 };
const COUNTRY_FOCUS_ZOOM = 3.25;

export function WorldMapPreview() {
  const mapRef = useRef<MapRef>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(
    null,
  );

  const { countryCount, totalMatches, maxMatches, countries } =
    getLiveMatchStats(LIVE_MATCH_COUNTRIES);

  const resetWorldView = useCallback(() => {
    setSelectedCountryCode(null);
    mapRef.current?.flyTo({
      ...WORLD_VIEW,
      duration: 900,
      essential: true,
    });
  }, []);

  const focusCountry = useCallback((country: CountryMatchActivity) => {
    setSelectedCountryCode(country.code);
    mapRef.current?.flyTo({
      center: [country.longitude, country.latitude],
      zoom: COUNTRY_FOCUS_ZOOM,
      duration: 900,
      essential: true,
    });
  }, []);

  return (
    <section className="relative w-full border-y border-border">
      <div className="relative h-[min(88vh,calc(100dvh-10rem))] min-h-[28rem] w-full">
        <Map
          ref={mapRef}
          theme="light"
          center={WORLD_VIEW.center}
          zoom={WORLD_VIEW.zoom}
          minZoom={0.85}
          maxZoom={6}
          attributionControl={false}
          className="h-full w-full"
        >
          {countries.map((country, index) => (
            <CountryLivePin
              key={country.code}
              country={country}
              maxMatches={maxMatches}
              pulseDelay={index * 0.35}
            />
          ))}
        </Map>

        <div className="pointer-events-none absolute left-4 top-4 z-10 sm:left-6 sm:top-6">
          <MapLiveStatsCard
            countryCount={countryCount}
            totalMatches={totalMatches}
            countries={countries}
            trendPercent={TREND_PERCENT}
            selectedCountryCode={selectedCountryCode}
            onCountrySelect={focusCountry}
            onResetView={resetWorldView}
          />
        </div>

        <Link
          href="/map"
          className="absolute bottom-4 right-4 z-10 rounded-lg bg-white/90 px-3 py-2 text-xs font-semibold text-neutral-800 shadow-sm backdrop-blur-sm hover:bg-white sm:bottom-6 sm:right-6"
        >
          Open full map
        </Link>
      </div>
    </section>
  );
}
