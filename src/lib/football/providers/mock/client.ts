import type { LeagueProfile, LeagueRegion, LeagueTier } from "@/lib/data/league-profile";
import type { NewsArticle } from "@/lib/data/news-article";
import { buildPlayerProfile } from "@/lib/data/player-mock";
import { buildTeamProfile } from "@/lib/data/team-mock";
import {
  getMockLeagueById,
  getMockLeagues,
} from "@/lib/data/mock-leagues";
import { getMockNewsArticles } from "@/lib/data/mock-news";
import type {
  FootballDataProvider,
  PlayerSlugMatch,
} from "@/lib/football/provider";
import { buildSnapshotFromMatches } from "@/lib/football/providers/mock/build-snapshot";
import {
  MOCK_FUTURE_MATCHES,
  MOCK_LIVE_MATCHES,
} from "@/lib/football/providers/mock/fixtures";
import type { MapMatchMode } from "@/lib/data/map-match-mode";
import { findPlayerBySlug as findMockPlayerBySlug } from "@/lib/player-paths";
import { findStandingBySlug } from "@/lib/team-paths";

const MOCK_LATENCY_MS = 180;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createMockProvider(): FootballDataProvider {
  return {
    id: "mock",

    async getMapCountries(mode: MapMatchMode) {
      await delay(MOCK_LATENCY_MS);

      const matches = mode === "live" ? MOCK_LIVE_MATCHES : MOCK_FUTURE_MATCHES;
      return buildSnapshotFromMatches(matches, mode);
    },

    async getLeagues() {
      await delay(MOCK_LATENCY_MS);
      return getMockLeagues();
    },

    async getLeagueById(id) {
      await delay(MOCK_LATENCY_MS);
      return getMockLeagueById(id);
    },

    async getTeamProfile(leagueId, teamSlug) {
      await delay(MOCK_LATENCY_MS);
      const league = getMockLeagueById(leagueId);
      const standing = league ? findStandingBySlug(league, teamSlug) : null;
      if (!league || !standing) return null;
      return buildTeamProfile(league, standing);
    },

    async findPlayerBySlug(leagueId, playerSlug) {
      await delay(MOCK_LATENCY_MS);
      const match = findMockPlayerBySlug(leagueId, playerSlug);
      if (!match) return null;

      const result: PlayerSlugMatch = {
        league: match.league,
        standing: match.standing,
        playerId: match.slot,
        name: match.name,
        slot: match.slot,
      };
      return result;
    },

    async getPlayerProfile(match) {
      await delay(MOCK_LATENCY_MS);
      return buildPlayerProfile(match.league, match.standing, match.slot);
    },

    async getNewsArticles() {
      await delay(MOCK_LATENCY_MS);
      return getMockNewsArticles();
    },
  };
}
