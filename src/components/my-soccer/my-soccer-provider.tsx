"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LiveMatch } from "@/lib/data/live-match";
import {
  favoriteTeamKey,
  readFavoriteTeams,
  writeFavoriteTeams,
  MAX_FAVORITE_TEAMS,
  type FavoriteTeam,
} from "@/lib/my-soccer";
import {
  bulkAddToWatchlist,
  MAX_WATCHLIST,
  readWatchlistIds,
  writeWatchlistIds,
  type MonitoredMatch,
} from "@/lib/match-monitor";

type MySoccerContextValue = {
  ready: boolean;
  watchlistIds: number[];
  favorites: FavoriteTeam[];
  isWatching: (fixtureId: number) => boolean;
  addMatch: (fixtureId: number) => boolean;
  removeMatch: (fixtureId: number) => void;
  toggleMatch: (fixtureId: number) => boolean;
  bulkAddMatches: (items: MonitoredMatch[]) => void;
  clearWatchlist: () => void;
  atWatchlistCapacity: boolean;
  isFollowing: (leagueId: string, teamSlug: string) => boolean;
  addFavorite: (team: FavoriteTeam) => boolean;
  removeFavorite: (leagueId: string, teamSlug: string) => void;
  toggleFavorite: (team: FavoriteTeam) => boolean;
  atFavoritesCapacity: boolean;
};

const MySoccerContext = createContext<MySoccerContextValue | null>(null);

export function MySoccerProvider({ children }: { children: ReactNode }) {
  const [watchlistIds, setWatchlistIds] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<FavoriteTeam[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setWatchlistIds(readWatchlistIds());
    setFavorites(readFavoriteTeams());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeWatchlistIds(watchlistIds);
  }, [ready, watchlistIds]);

  useEffect(() => {
    if (!ready) return;
    writeFavoriteTeams(favorites);
  }, [favorites, ready]);

  const isWatching = useCallback(
    (fixtureId: number) => watchlistIds.includes(fixtureId),
    [watchlistIds],
  );

  const addMatch = useCallback((fixtureId: number) => {
    let added = false;
    setWatchlistIds((current) => {
      if (current.includes(fixtureId) || current.length >= MAX_WATCHLIST) return current;
      added = true;
      return [...current, fixtureId];
    });
    return added;
  }, []);

  const removeMatch = useCallback((fixtureId: number) => {
    setWatchlistIds((current) => current.filter((id) => id !== fixtureId));
  }, []);

  const toggleMatch = useCallback((fixtureId: number) => {
    let added = false;
    setWatchlistIds((current) => {
      if (current.includes(fixtureId)) {
        return current.filter((id) => id !== fixtureId);
      }
      if (current.length >= MAX_WATCHLIST) return current;
      added = true;
      return [...current, fixtureId];
    });
    return added;
  }, []);

  const bulkAddMatches = useCallback((items: MonitoredMatch[]) => {
    setWatchlistIds((current) => bulkAddToWatchlist(current, items));
  }, []);

  const clearWatchlist = useCallback(() => {
    setWatchlistIds([]);
  }, []);

  const isFollowing = useCallback(
    (leagueId: string, teamSlug: string) =>
      favorites.some((team) => favoriteTeamKey(team) === favoriteTeamKey({ leagueId, teamSlug })),
    [favorites],
  );

  const addFavorite = useCallback((team: FavoriteTeam) => {
    let added = false;
    setFavorites((current) => {
      const key = favoriteTeamKey(team);
      if (current.some((item) => favoriteTeamKey(item) === key)) return current;
      if (current.length >= MAX_FAVORITE_TEAMS) return current;
      added = true;
      return [...current, team];
    });
    return added;
  }, []);

  const removeFavorite = useCallback((leagueId: string, teamSlug: string) => {
    const key = favoriteTeamKey({ leagueId, teamSlug });
    setFavorites((current) => current.filter((team) => favoriteTeamKey(team) !== key));
  }, []);

  const toggleFavorite = useCallback(
    (team: FavoriteTeam) => {
      if (isFollowing(team.leagueId, team.teamSlug)) {
        removeFavorite(team.leagueId, team.teamSlug);
        return false;
      }
      return addFavorite(team);
    },
    [addFavorite, isFollowing, removeFavorite],
  );

  const value = useMemo(
    () => ({
      ready,
      watchlistIds,
      favorites,
      isWatching,
      addMatch,
      removeMatch,
      toggleMatch,
      bulkAddMatches,
      clearWatchlist,
      atWatchlistCapacity: watchlistIds.length >= MAX_WATCHLIST,
      isFollowing,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      atFavoritesCapacity: favorites.length >= MAX_FAVORITE_TEAMS,
    }),
    [
      addFavorite,
      addMatch,
      bulkAddMatches,
      clearWatchlist,
      favorites,
      isFollowing,
      isWatching,
      ready,
      removeFavorite,
      removeMatch,
      toggleFavorite,
      toggleMatch,
      watchlistIds,
    ],
  );

  return <MySoccerContext.Provider value={value}>{children}</MySoccerContext.Provider>;
}

export function useMySoccer() {
  const context = useContext(MySoccerContext);
  if (!context) {
    throw new Error("useMySoccer must be used within MySoccerProvider");
  }
  return context;
}

/** For components that may render before hydration completes. */
export function useOptionalMySoccer() {
  return useContext(MySoccerContext);
}

/** Convenience for match rows that already have a LiveMatch object. */
export function useTrackMatch() {
  const ctx = useMySoccer();
  return {
    isWatching: ctx.isWatching,
    toggle: (match: Pick<LiveMatch, "id">) => ctx.toggleMatch(match.id),
    add: (match: Pick<LiveMatch, "id">) => ctx.addMatch(match.id),
    remove: (match: Pick<LiveMatch, "id">) => ctx.removeMatch(match.id),
    atCapacity: ctx.atWatchlistCapacity,
  };
}
