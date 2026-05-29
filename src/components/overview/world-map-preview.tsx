"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CountryLivePin } from "@/components/overview/country-live-pin";
import { CountryMatchesPanel } from "@/components/overview/country-matches-panel";
import { MapLiveStatsCard } from "@/components/overview/map-live-stats-card";
import { MatchMapLegend } from "@/components/overview/match-map-legend";
import { MatchVenuePin } from "@/components/overview/match-venue-pin";
import { Map, type MapRef } from "@/components/ui/map";
import type { LiveMatch } from "@/lib/data/live-match";
import type {
  CountryMatchActivity,
  LiveCountriesResponse,
} from "@/lib/data/live-match-countries";
import { getLiveMatchStats } from "@/lib/data/live-match-countries";
import { apiRequest } from "@/lib/http/api-client";
import { cn } from "@/lib/utils";

const WORLD_VIEW = { center: [0, 22] as [number, number], zoom: 1.2 };
const COUNTRY_FOCUS_ZOOM = 3.25;
const REFRESH_MS = 60_000;
const SPLIT_TRANSITION_MS = 700;
const MAP_FLY_MS = 900;

const EMPTY_STATS = getLiveMatchStats([]);
const NO_PADDING = { top: 0, right: 0, bottom: 0, left: 0 };

function mapFocusPadding(pane: HTMLElement | null, withLegend: boolean) {
  const width = pane?.clientWidth ?? 800;
  const height = pane?.clientHeight ?? 600;

  return {
    top: 48,
    right: 32,
    left: Math.min(220, Math.round(width * 0.2)),
    bottom: withLegend ? Math.min(150, Math.round(height * 0.2)) : 48,
  };
}

export function WorldMapPreview() {
  const mapRef = useRef<MapRef>(null);
  const mapPaneRef = useRef<HTMLDivElement>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(
    null,
  );
  const [splitOpen, setSplitOpen] = useState(false);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [matchesByCountry, setMatchesByCountry] = useState<
    Record<string, LiveMatch[]>
  >({});
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
      setMatchesByCountry(data.matchesByCountry ?? {});
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

  const { countryCount, totalMatches, maxMatches, countries } = stats;

  const selectedCountry = useMemo(
    () => countries.find((country) => country.code === selectedCountryCode),
    [countries, selectedCountryCode],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const resizeSoon = window.setTimeout(() => map.resize(), 50);
    const resizeAfterTransition = window.setTimeout(
      () => map.resize(),
      SPLIT_TRANSITION_MS + 80,
    );

    return () => {
      window.clearTimeout(resizeSoon);
      window.clearTimeout(resizeAfterTransition);
    };
  }, [splitOpen]);

  useEffect(() => {
    if (!splitOpen || !selectedCountry) return;

    const country = selectedCountry;
    const timers: number[] = [];

    const flyToCountry = () => {
      const map = mapRef.current;
      if (!map) return;

      map.resize();
      map.flyTo({
        center: [country.longitude, country.latitude],
        zoom: COUNTRY_FOCUS_ZOOM,
        duration: MAP_FLY_MS,
        padding: mapFocusPadding(mapPaneRef.current, true),
        essential: true,
      });
    };

    timers.push(window.setTimeout(() => mapRef.current?.resize(), 50));
    timers.push(window.setTimeout(flyToCountry, SPLIT_TRANSITION_MS + 60));

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [splitOpen, selectedCountry]);

  const resetWorldView = useCallback(() => {
    setSplitOpen(false);

    window.setTimeout(() => {
      const map = mapRef.current;
      if (!map) return;

      map.resize();
      map.flyTo({
        ...WORLD_VIEW,
        padding: NO_PADDING,
        duration: MAP_FLY_MS,
        essential: true,
      });
    }, SPLIT_TRANSITION_MS + 60);

    window.setTimeout(() => setSelectedCountryCode(null), SPLIT_TRANSITION_MS);
  }, []);

  const focusCountry = useCallback((country: CountryMatchActivity) => {
    setSelectedCountryCode(country.code);
    setSplitOpen(true);
  }, []);

  const selectedMatches = selectedCountryCode
    ? (matchesByCountry[selectedCountryCode] ?? [])
    : [];

  const showMatchColumn = splitOpen && selectedCountry;
  const showMatchPins = Boolean(showMatchColumn);

  return (
    <section className="relative w-full border-y border-border">
      <div className="flex h-[min(88vh,calc(100dvh-10rem))] min-h-[28rem] w-full overflow-hidden">
        <div
          ref={mapPaneRef}
          className={cn(
            "relative h-full min-w-0 shrink-0 transition-[width] duration-700 ease-in-out",
            showMatchColumn ? "w-[70%]" : "w-full",
          )}
        >
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
            {!loading
              ? countries.map((country, index) => (
                  <CountryLivePin
                    key={country.code}
                    country={country}
                    maxMatches={maxMatches}
                    pulseDelay={index * 0.35}
                  />
                ))
              : null}

            {!loading && showMatchPins
              ? selectedMatches.map((match, index) => (
                  <MatchVenuePin
                    key={match.id}
                    match={match}
                    colorIndex={index}
                    pulseDelay={index * 0.25}
                  />
                ))
              : null}
          </Map>

          <div className="pointer-events-none absolute left-4 top-4 z-10 flex max-h-[calc(100%-2rem)] flex-col gap-3 sm:left-6 sm:top-6">
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

          {showMatchPins ? (
            <div className="pointer-events-none absolute bottom-4 left-4 z-10 sm:left-6">
              <MatchMapLegend matches={selectedMatches} />
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            "h-full min-w-0 shrink-0 overflow-hidden border-neutral-200 transition-[width,border-color] duration-700 ease-in-out",
            showMatchColumn ? "w-[30%] border-l" : "w-0 border-l-0",
          )}
        >
          {selectedCountry ? (
            <CountryMatchesPanel
              country={selectedCountry}
              matches={selectedMatches}
              onClose={resetWorldView}
              visible={splitOpen}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
