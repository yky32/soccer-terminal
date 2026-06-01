"use client";

import { CalendarDays, Search, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FootballLogo } from "@/components/overview/football-logo";
import { LeagueIcon } from "@/components/leagues/league-icon";
import { MatchHeatmapGrid } from "@/components/overview/match-heatmap-grid";
import { glassFocus, glassInset, glassStrong } from "@/components/glass-surface";
import type { LiveMatch } from "@/lib/data/live-match";
import type { LiveCountriesBothResponse } from "@/lib/data/live-match-countries";
import {
  bulkAddToWatchlist,
  countAddableMatches,
  FAMOUS_LEAGUES,
  filterFamousLeagueMatches,
  filterLeagueMatches,
  filterTodayMatches,
  flattenMapMatches,
  isMatchLive,
  MAX_WATCHLIST,
  matchMinuteLabel,
  readWatchlistIds,
  searchMatches,
  sortHeatmapItems,
  teamAbbrev,
  writeWatchlistIds,
  type MonitoredMatch,
} from "@/lib/match-monitor";
import { apiRequest } from "@/lib/http/api-client";
import { CLIENT_MAP_REFRESH_MS } from "@/lib/football/refresh-policy";
import { cn } from "@/lib/utils";

function QuickAddButton({
  icon: Icon,
  label,
  count,
  disabled,
  onClick,
}: {
  icon: typeof CalendarDays;
  label: string;
  count: number;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        glassInset,
        glassFocus,
        "inline-flex items-center gap-1.5 rounded-full py-1 pl-2 pr-2.5 text-[0.75rem] font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 sm:pr-3",
        "text-neutral-700 hover:bg-white/80 hover:text-neutral-950",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
      <span>{label}</span>
      {count > 0 ? (
        <span className="rounded-full bg-neutral-900/8 px-1.5 py-0.5 text-[0.625rem] font-semibold tabular-nums text-neutral-600">
          +{count}
        </span>
      ) : null}
    </button>
  );
}

function LeagueQuickAddButton({
  leagueName,
  leagueLogo,
  shortLabel,
  count,
  disabled,
  onClick,
}: {
  leagueName: string;
  leagueLogo: string | null;
  shortLabel: string;
  count: number;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={`Add ${leagueName} fixtures`}
      aria-label={`Add ${leagueName} fixtures`}
      className={cn(
        glassInset,
        glassFocus,
        "inline-flex items-center gap-1.5 rounded-full py-1 pl-1.5 pr-2.5 text-[0.75rem] font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 sm:pr-3",
        "text-neutral-700 hover:bg-white/80 hover:text-neutral-950",
      )}
    >
      <LeagueIcon league={{ logo: leagueLogo, name: leagueName }} size="xs" />
      <span>{shortLabel}</span>
      {count > 0 ? (
        <span className="rounded-full bg-neutral-900/8 px-1.5 py-0.5 text-[0.625rem] font-semibold tabular-nums text-neutral-600">
          +{count}
        </span>
      ) : null}
    </button>
  );
}

function SearchResultRow({
  item,
  selected,
  onSelect,
}: {
  item: MonitoredMatch;
  selected: boolean;
  onSelect: () => void;
}) {
  const { match, mode } = item;
  const live = isMatchLive(match);

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={selected}
      className={cn(
        "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
        selected
          ? "cursor-default bg-neutral-100/80 opacity-60"
          : "hover:bg-white/70",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <FootballLogo src={match.homeLogo} label={match.homeTeam} size="xs" />
        <span className="min-w-0 truncate text-[0.8125rem] font-medium text-neutral-900">
          {match.homeTeam}
        </span>
        <span className="shrink-0 text-[0.75rem] font-bold tabular-nums text-neutral-700">
          {live ? `${match.homeGoals}–${match.awayGoals}` : "vs"}
        </span>
        <span className="min-w-0 truncate text-[0.8125rem] font-medium text-neutral-900">
          {match.awayTeam}
        </span>
        <FootballLogo src={match.awayLogo} label={match.awayTeam} size="xs" />
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-[0.6875rem] font-medium text-neutral-500">{match.league}</p>
        <p className="text-[0.6875rem] tabular-nums text-neutral-400">
          {live ? `${matchMinuteLabel(match)} · live` : matchMinuteLabel(match)}
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide",
          mode === "live"
            ? "bg-emerald-100 text-emerald-800"
            : "bg-sky-100 text-sky-800",
        )}
      >
        {selected ? "Added" : "Add"}
      </span>
    </button>
  );
}

export function MatchMonitorSection() {
  const [catalog, setCatalog] = useState<MonitoredMatch[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const loadCatalog = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    try {
      if (!silent) setLoading(true);
      const { data } = await apiRequest<LiveCountriesBothResponse>({
        scope: "client",
        provider: "internal",
        method: "GET",
        url: "/api/map/live-countries",
        query: { mode: "both" },
      });

      if (data.error) throw new Error(data.error);

      setCatalog(
        flattenMapMatches(
          data.live.matchesByCountry ?? {},
          data.future.matchesByCountry ?? {},
        ),
      );
      setUpdatedAt(data.live.updatedAt ?? data.future.updatedAt ?? null);
      setError(null);
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Failed to load matches");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    setWatchlistIds(readWatchlistIds());
    void loadCatalog();
    const interval = setInterval(
      () => void loadCatalog({ silent: true }),
      CLIENT_MAP_REFRESH_MS,
    );
    return () => clearInterval(interval);
  }, [loadCatalog]);

  useEffect(() => {
    writeWatchlistIds(watchlistIds);
  }, [watchlistIds]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!searchRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const catalogById = useMemo(() => {
    const map = new Map<number, MonitoredMatch>();
    for (const item of catalog) map.set(item.match.id, item);
    return map;
  }, [catalog]);

  const watchedItems = useMemo(
    () =>
      sortHeatmapItems(
        watchlistIds
          .map((id) => catalogById.get(id))
          .filter((item): item is MonitoredMatch => item !== undefined),
      ),
    [watchlistIds, catalogById],
  );

  const searchResults = useMemo(() => {
    if (!searchOpen) return [];
    return searchMatches(catalog, searchQuery);
  }, [catalog, searchQuery, searchOpen]);

  const todayMatches = useMemo(() => filterTodayMatches(catalog), [catalog]);
  const famousMatches = useMemo(() => filterFamousLeagueMatches(catalog), [catalog]);

  const todayAddable = useMemo(
    () => countAddableMatches(todayMatches, watchlistIds),
    [todayMatches, watchlistIds],
  );
  const famousAddable = useMemo(
    () => countAddableMatches(famousMatches, watchlistIds),
    [famousMatches, watchlistIds],
  );

  const famousLeagueQuickAdds = useMemo(
    () =>
      FAMOUS_LEAGUES.map((league) => {
        const pool = filterLeagueMatches(catalog, league.name);
        return {
          ...league,
          logo: pool[0]?.match.leagueLogo ?? null,
          pool,
          addable: countAddableMatches(pool, watchlistIds),
        };
      }),
    [catalog, watchlistIds],
  );

  const addMatch = useCallback((match: LiveMatch) => {
    setWatchlistIds((current) => {
      if (current.includes(match.id)) return current;
      if (current.length >= MAX_WATCHLIST) return current;
      return [...current, match.id];
    });
  }, []);

  const addMatchesBulk = useCallback((items: MonitoredMatch[]) => {
    setWatchlistIds((current) => bulkAddToWatchlist(current, items));
  }, []);

  const removeMatch = useCallback((matchId: number) => {
    setWatchlistIds((current) => current.filter((id) => id !== matchId));
  }, []);

  const clearWatchlist = useCallback(() => {
    setWatchlistIds([]);
  }, []);

  const atCapacity = watchlistIds.length >= MAX_WATCHLIST;

  return (
    <section id="match-monitor" className="w-full scroll-mt-[4.25rem] pb-10 pt-10 sm:pb-14 sm:pt-12">
      <div className="border-b border-black/[0.06] px-4 pb-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-heading font-semibold text-foreground">Match monitor</h2>
            <p className="text-body mt-2 max-w-2xl text-muted">
              Search fixtures, build a watchlist, and track scores in a live heat map — like
              a market board for the matches you care about.
            </p>
          </div>
          {updatedAt ? (
            <p className="text-[0.75rem] tabular-nums text-neutral-400">
              Updated{" "}
              {new Date(updatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          ) : null}
        </div>

        <div ref={searchRef} className="relative mt-6 max-w-2xl">
          <div
            className={cn(
              glassInset,
              "flex items-center gap-2 rounded-xl px-3 py-2.5 sm:px-4",
            )}
          >
            <Search className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search team, league, or country…"
              className="min-w-0 flex-1 bg-transparent text-[0.875rem] text-neutral-900 outline-none placeholder:text-neutral-400"
              aria-expanded={searchOpen}
              aria-controls="match-monitor-search-results"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchOpen(true);
                }}
                className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-white/60 hover:text-neutral-700"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {searchOpen ? (
            <div
              id="match-monitor-search-results"
              className={cn(
                glassStrong,
                "!overflow-y-auto overflow-x-hidden",
                "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 max-h-[min(22rem,50vh)] overscroll-contain rounded-xl shadow-[0_16px_48px_rgba(15,23,42,0.14)]",
              )}
            >
              {loading ? (
                <p className="px-4 py-6 text-[0.8125rem] text-neutral-500">Loading matches…</p>
              ) : error ? (
                <p className="px-4 py-6 text-[0.8125rem] text-rose-600">{error}</p>
              ) : searchResults.length === 0 ? (
                <p className="px-4 py-6 text-[0.8125rem] text-neutral-500">
                  No matches found. Try a team or league name.
                </p>
              ) : (
                <div className="divide-y divide-black/[0.05]">
                  {searchResults.map((item) => (
                    <SearchResultRow
                      key={item.match.id}
                      item={item}
                      selected={watchlistIds.includes(item.match.id)}
                      onSelect={() => addMatch(item.match)}
                    />
                  ))}
                </div>
              )}
              {atCapacity ? (
                <p className="border-t border-black/[0.05] px-4 py-2.5 text-[0.75rem] text-amber-700">
                  Watchlist full ({MAX_WATCHLIST} matches). Remove one to add another.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-400">
            Quick add
          </span>
          <QuickAddButton
            icon={CalendarDays}
            label="Today"
            count={todayAddable}
            disabled={loading || todayAddable === 0 || atCapacity}
            onClick={() => addMatchesBulk(todayMatches)}
          />
          <QuickAddButton
            icon={Sparkles}
            label="All top"
            count={famousAddable}
            disabled={loading || famousAddable === 0 || atCapacity}
            onClick={() => addMatchesBulk(famousMatches)}
          />
          <span className="hidden h-4 w-px bg-black/10 sm:block" aria-hidden />
          {famousLeagueQuickAdds.map((league) => (
            <LeagueQuickAddButton
              key={league.name}
              leagueName={league.name}
              leagueLogo={league.logo}
              shortLabel={league.shortLabel}
              count={league.addable}
              disabled={loading || league.addable === 0 || atCapacity}
              onClick={() => addMatchesBulk(league.pool)}
            />
          ))}
        </div>

        {watchlistIds.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {watchedItems.map(({ match }) => (
              <button
                key={match.id}
                type="button"
                onClick={() => removeMatch(match.id)}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/50 py-1 pl-1.5 pr-2.5 text-[0.75rem] font-medium text-neutral-700 transition-colors hover:bg-white/80"
              >
                <FootballLogo src={match.homeLogo} label={match.homeTeam} size="xs" />
                <span className="min-w-0 truncate tabular-nums">
                  {teamAbbrev(match.homeTeam)} vs {teamAbbrev(match.awayTeam)}
                </span>
                <FootballLogo src={match.awayLogo} label={match.awayTeam} size="xs" />
                <X className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
              </button>
            ))}
            <button
              type="button"
              onClick={clearWatchlist}
              className="text-[0.75rem] font-medium text-neutral-500 transition-colors hover:text-neutral-800"
            >
              Clear all
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-0 w-full">
        <MatchHeatmapGrid items={watchedItems} onRemove={removeMatch} fullWidth />
      </div>
    </section>
  );
}
