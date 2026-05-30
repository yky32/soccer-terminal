"use client";

import { useEffect, useMemo, useState } from "react";
import { FootballLogo } from "@/components/overview/football-logo";
import {
  buildLeagueFilterOptions,
  LeagueFilterChips,
  LeagueFilterToggle,
} from "@/components/overview/league-filter-chips";
import { MatchEventCard } from "@/components/overview/match-event-card";
import type { LiveMatch } from "@/lib/data/live-match";
import type { CountryMatchActivity } from "@/lib/data/live-match-countries";
import type { MapMatchMode } from "@/lib/data/map-match-mode";
import { glassFocus, glassInset, glassStrong } from "@/components/glass-surface";
import { cn } from "@/lib/utils";

type CountryMatchesPanelProps = {
  country: CountryMatchActivity;
  matches: LiveMatch[];
  matchMode?: MapMatchMode;
  onClose: () => void;
  visible?: boolean;
};

export function CountryMatchesPanel({
  country,
  matches,
  matchMode = "live",
  onClose,
  visible = true,
}: CountryMatchesPanelProps) {
  const [selectedLeagues, setSelectedLeagues] = useState<Set<string>>(new Set());
  const [filterExpanded, setFilterExpanded] = useState(false);

  const leagueOptions = useMemo(() => buildLeagueFilterOptions(matches), [matches]);
  const leagues = useMemo(() => leagueOptions.map((option) => option.name), [leagueOptions]);

  useEffect(() => {
    setSelectedLeagues(new Set(leagues));
    setFilterExpanded(false);
  }, [country.code, matchMode]);

  useEffect(() => {
    setSelectedLeagues((prev) => {
      const stillValid = [...prev].filter((league) => leagues.includes(league));
      if (stillValid.length > 0) return new Set(stillValid);
      return new Set(leagues);
    });
  }, [leagues]);

  const allLeaguesSelected =
    leagues.length > 0 && selectedLeagues.size === leagues.length;

  const filteredMatches = useMemo(() => {
    if (selectedLeagues.size === 0) return [];
    return matches.filter((match) => selectedLeagues.has(match.league));
  }, [matches, selectedLeagues]);

  const matchColorIndex = useMemo(() => {
    const indexById = new Map<number, number>();
    matches.forEach((match, index) => indexById.set(match.id, index));
    return indexById;
  }, [matches]);

  const toggleLeague = (league: string) => {
    setSelectedLeagues((current) => {
      const next = new Set(current);
      if (next.has(league)) next.delete(league);
      else next.add(league);
      return next;
    });
  };

  const selectAllLeagues = () => setSelectedLeagues(new Set(leagues));
  const clearAllLeagues = () => setSelectedLeagues(new Set());

  const showLeagueFilter = leagueOptions.length > 1;
  const selectedLeagueCount = leagueOptions.filter((option) =>
    selectedLeagues.has(option.name),
  ).length;

  const panelTitle = matchMode === "live" ? "Live matches" : "Upcoming matches";
  const emptyCountryLabel =
    matchMode === "live"
      ? "No live matches in this country right now."
      : "No upcoming matches in this country for the next 7 days.";
  const emptyFilterLabel =
    matchMode === "live"
      ? "No live matches for the selected leagues."
      : "No upcoming matches for the selected leagues.";

  return (
    <aside
      className={cn(
        glassStrong,
        "relative flex h-full min-h-0 w-full flex-col rounded-none border-l border-white/45 shadow-[-10px_0_36px_rgba(15,23,42,0.07)] transition-opacity duration-700 ease-in-out",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!visible}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-gradient-to-r from-white/0 via-white/10 to-white/35"
        aria-hidden
      />

      <div className="relative z-[2] flex min-h-0 flex-1 flex-col">
        <div className={cn(glassInset, "shrink-0 border-b border-black/[0.06] px-3 py-3")}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2.5">
              {matches[0]?.countryFlag ? (
                <FootballLogo
                  src={matches[0].countryFlag}
                  label={country.name}
                  size="lg"
                  className="rounded-sm object-cover ring-1 ring-white/60"
                />
              ) : null}
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  {panelTitle}
                </p>
                <p className="truncate text-sm font-bold tracking-[-0.01em] text-neutral-950">
                  {country.name}
                </p>
                <p className="text-[11px] text-neutral-600">
                  {allLeaguesSelected
                    ? `${filteredMatches.length} ${filteredMatches.length === 1 ? "fixture" : "fixtures"}`
                    : `${filteredMatches.length} of ${matches.length} ${matches.length === 1 ? "fixture" : "fixtures"}`}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-start gap-1.5">
              {showLeagueFilter ? (
                <LeagueFilterToggle
                  expanded={filterExpanded}
                  selectedCount={selectedLeagueCount}
                  totalCount={leagueOptions.length}
                  onClick={() => setFilterExpanded((open) => !open)}
                />
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  glassInset,
                  glassFocus,
                  "shrink-0 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-700 transition-colors hover:text-neutral-950",
                )}
              >
                Back
              </button>
            </div>
          </div>
        </div>

        {showLeagueFilter && filterExpanded ? (
          <LeagueFilterChips
            leagues={leagueOptions}
            selectedLeagues={selectedLeagues}
            onToggle={toggleLeague}
            onSelectAll={selectAllLeagues}
            onClearAll={clearAllLeagues}
          />
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
          {filteredMatches.length > 0 ? (
            <ul className="grid grid-cols-1 gap-2.5">
              {filteredMatches.map((match) => (
                <li key={match.id}>
                  <MatchEventCard
                    match={match}
                    matchMode={matchMode}
                    compact
                    colorIndex={matchColorIndex.get(match.id)}
                  />
                </li>
              ))}
            </ul>
          ) : matches.length > 0 && selectedLeagues.size === 0 ? (
            <p className="px-2 py-8 text-center text-xs leading-relaxed text-neutral-600">
              Open Filter leagues and select at least one league.
            </p>
          ) : matches.length > 0 ? (
            <p className="px-2 py-8 text-center text-xs leading-relaxed text-neutral-600">
              {emptyFilterLabel}
            </p>
          ) : (
            <p className="px-2 py-8 text-center text-xs leading-relaxed text-neutral-600">
              {emptyCountryLabel}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
