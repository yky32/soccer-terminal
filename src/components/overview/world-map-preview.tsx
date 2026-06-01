"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpToLine, Globe2 } from "lucide-react";
import { CountryLivePin } from "@/components/overview/country-live-pin";
import { CountryMatchesPanel } from "@/components/overview/country-matches-panel";
import { MapLiveStatsCard } from "@/components/overview/map-live-stats-card";
import { MatchMapLegend } from "@/components/overview/match-map-legend";
import { MatchVenuePin } from "@/components/overview/match-venue-pin";
import { Map, type MapRef } from "@/components/ui/map";
import type { LiveMatch } from "@/lib/data/live-match";
import type { CountryMatchActivity } from "@/lib/data/live-match-countries";
import type { MapMatchMode } from "@/lib/data/map-match-mode";
import { getLiveMatchStats } from "@/lib/data/live-match-countries";
import { useMapCountries } from "@/components/overview/map-countries-context";
import { glassFocus, glassHover, glassInset } from "@/components/glass-surface";
import { scrollToSection } from "@/lib/scroll-to-section";
import { cn } from "@/lib/utils";

const EMPTY_STATS = getLiveMatchStats([]);

const WORLD_VIEW = { center: [0, 22] as [number, number], zoom: 1.2 };
const COUNTRY_FOCUS_ZOOM = 3.25;
const SPLIT_TRANSITION_MS = 700;
const MAP_FLY_MS = 900;
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

type MapControlsToolbarProps = {
  onFocusMapSection: () => void;
  onResetMapView: () => void;
  /** Lift toolbar when the bottom-center live chip is visible. */
  raised: boolean;
};

function MapControlsToolbar({
  onFocusMapSection,
  onResetMapView,
  raised,
}: MapControlsToolbarProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute right-4 z-10 sm:right-6",
        raised ? "bottom-20 sm:bottom-[4.75rem]" : "bottom-6 sm:bottom-8",
      )}
    >
      <div
        className={cn(
          glassInset,
          "pointer-events-auto flex items-center gap-1 rounded-full p-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)]",
        )}
        role="toolbar"
        aria-label="Map controls"
      >
        <button
          type="button"
          onClick={onFocusMapSection}
          title="Scroll to map"
          aria-label="Scroll to map"
          className={cn(
            glassHover,
            glassFocus,
            "flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:text-neutral-950",
          )}
        >
          <ArrowUpToLine className="h-4 w-4" strokeWidth={2.25} aria-hidden />
        </button>
        <button
          type="button"
          onClick={onResetMapView}
          title="Reset map to world view"
          aria-label="Reset map to world view"
          className={cn(
            glassHover,
            glassFocus,
            "flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:text-neutral-950",
          )}
        >
          <Globe2 className="h-4 w-4" strokeWidth={2.25} aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function WorldMapPreview() {
  const mapRef = useRef<MapRef>(null);
  const mapPaneRef = useRef<HTMLDivElement>(null);
  const { data, loading, error: fetchError } = useMapCountries();
  const [matchMode, setMatchMode] = useState<MapMatchMode>("live");
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(
    null,
  );
  const [splitOpen, setSplitOpen] = useState(false);

  const modeSnapshot = matchMode === "live" ? data?.live : data?.future;
  const stats = useMemo(
    () => getLiveMatchStats(modeSnapshot?.countries ?? []),
    [modeSnapshot?.countries],
  );
  const matchesByCountry = modeSnapshot?.matchesByCountry ?? {};
  const updatedAt = modeSnapshot?.updatedAt ?? null;
  const error = fetchError;

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

  const fitMapToWorld = useCallback((afterLayoutMs = 0) => {
    const fly = () => {
      const map = mapRef.current;
      if (!map) return;

      map.resize();
      map.flyTo({
        center: WORLD_VIEW.center,
        zoom: WORLD_VIEW.zoom,
        bearing: 0,
        pitch: 0,
        padding: NO_PADDING,
        duration: MAP_FLY_MS,
        essential: true,
      });
    };

    if (afterLayoutMs > 0) {
      window.setTimeout(fly, afterLayoutMs);
      return;
    }

    fly();
  }, []);

  const resetWorldView = useCallback(() => {
    setSplitOpen(false);
    fitMapToWorld(SPLIT_TRANSITION_MS + 60);
    window.setTimeout(() => setSelectedCountryCode(null), SPLIT_TRANSITION_MS);
  }, [fitMapToWorld]);

  const focusMapSection = useCallback(() => {
    scrollToSection("global-map");
  }, []);

  const resetMapCamera = useCallback(() => {
    fitMapToWorld(splitOpen ? SPLIT_TRANSITION_MS + 60 : 0);
  }, [fitMapToWorld, splitOpen]);

  const focusCountry = useCallback((country: CountryMatchActivity) => {
    setSelectedCountryCode(country.code);
    setSplitOpen(true);
  }, []);

  const handleModeChange = useCallback(
    (mode: MapMatchMode) => {
      if (mode === matchMode) return;
      resetWorldView();
      setMatchMode(mode);
    },
    [matchMode, resetWorldView],
  );

  const selectedMatches = selectedCountryCode
    ? (matchesByCountry[selectedCountryCode] ?? [])
    : [];

  const showMatchColumn = splitOpen && selectedCountry;
  const showMatchPins = Boolean(showMatchColumn);

  const showLiveChip = !showMatchColumn && !loading;

  return (
    <section id="global-map" className="relative w-full scroll-mt-[4.25rem]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-sky-400/70 to-transparent"
        aria-hidden
      />

      <div className="relative flex h-[min(92vh,calc(100dvh-4.25rem))] min-h-[30rem] w-full overflow-hidden sm:min-h-[34rem]">
        <div
          ref={mapPaneRef}
          className={cn(
            "relative h-full min-w-0 shrink-0 transition-[width] duration-700 ease-in-out",
            showMatchColumn ? "w-[70%]" : "w-full",
          )}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-28 bg-gradient-to-b from-[#eef1f6] via-[#eef1f6]/80 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-36 bg-gradient-to-t from-[#eef1f6] via-[#eef1f6]/70 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-[4] shadow-[inset_0_0_120px_rgba(15,23,42,0.08)]"
            aria-hidden
          />

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
                    mode={matchMode}
                    pulseDelay={index * 0.35}
                  />
                ))
              : null}

            {!loading && showMatchPins
              ? selectedMatches.map((match, index) => (
                  <MatchVenuePin
                    key={match.id}
                    match={match}
                    mode={matchMode}
                    colorIndex={index}
                    pulseDelay={index * 0.25}
                  />
                ))
              : null}
          </Map>

          <MapControlsToolbar
            onFocusMapSection={focusMapSection}
            onResetMapView={resetMapCamera}
            raised={showLiveChip}
          />

          {!showMatchColumn && !loading ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex justify-center px-4 sm:bottom-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/55 px-4 py-2 text-[0.8125rem] font-semibold tracking-[-0.01em] text-neutral-900 shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" />
                  <span className="relative m-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span>
                  {matchMode === "live" ? "Live worldwide" : "Upcoming fixtures"}
                </span>
                <span className="text-neutral-500" aria-hidden>
                  ·
                </span>
                <span className="tabular-nums text-neutral-700">
                  {countryCount} {countryCount === 1 ? "country" : "countries"}
                </span>
              </div>
            </div>
          ) : null}

          <div className="pointer-events-none absolute left-4 top-4 z-10 flex max-h-[calc(100%-2rem)] flex-col gap-3 sm:left-6 sm:top-6">
            <MapLiveStatsCard
              mode={matchMode}
              onModeChange={handleModeChange}
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
            "relative z-10 h-full min-w-0 shrink-0 overflow-hidden transition-[width] duration-700 ease-in-out",
            showMatchColumn ? "w-[30%] min-w-[17.5rem] sm:min-w-[19rem]" : "w-0",
          )}
        >
          {selectedCountry ? (
            <CountryMatchesPanel
              country={selectedCountry}
              matches={selectedMatches}
              matchMode={matchMode}
              onClose={resetWorldView}
              visible={splitOpen}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
