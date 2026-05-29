"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CountryLivePin } from "@/components/overview/country-live-pin";
import { MapLiveStatsCard } from "@/components/overview/map-live-stats-card";
import { Map, type MapRef } from "@/components/ui/map";
import type {
  CountryMatchActivity,
  LiveCountriesResponse,
} from "@/lib/data/live-match-countries";
import { getLiveMatchStats } from "@/lib/data/live-match-countries";
import { apiRequest } from "@/lib/http/api-client";

const WORLD_VIEW = { center: [0, 22] as [number, number], zoom: 1.2 };
const COUNTRY_FOCUS_ZOOM = 3.25;
const REFRESH_MS = 60_000;

const EMPTY_STATS = getLiveMatchStats([]);

export function WorldMapPreview() {
  const mapRef = useRef<MapRef>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(
    null,
  );
  const [stats, setStats] = useState(EMPTY_STATS);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLiveCountries = useCallback(async () => {
    try {
      const { data } = await apiRequest<LiveCountriesResponse>({
        scope: "client",
        provider: "internal",
        method: "GET",
        url: "/api/map/live-countries",
      });

      if (data.error) {
        throw new Error(data.error);
      }

      setStats(getLiveMatchStats(data.countries ?? []));
      setUpdatedAt(data.updatedAt ?? null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load live matches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLiveCountries();
    const interval = setInterval(loadLiveCountries, REFRESH_MS);
    return () => clearInterval(interval);
  }, [loadLiveCountries]);

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

  const { countryCount, totalMatches, maxMatches, countries } = stats;

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
          {!loading &&
            countries.map((country, index) => (
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
            selectedCountryCode={selectedCountryCode}
            onCountrySelect={focusCountry}
            onResetView={resetWorldView}
            loading={loading}
            error={error}
            updatedAt={updatedAt}
          />
        </div>
      </div>
    </section>
  );
}
