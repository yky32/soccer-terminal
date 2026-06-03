import type { LiveMatch } from "@/lib/data/live-match";
import type { CountryMatchActivity } from "@/lib/data/live-match-countries";
import { getCountryCentroid } from "@/lib/football/country-centroids";
import {
  getCatalogEntryForApiLeague,
  resolveLeagueFlag,
  resolveLeagueLogo,
} from "@/lib/football/league-catalog";
import {
  countryCodeFromLeagueCountry,
  countryCodeFromLeagueFlag,
} from "@/lib/football/providers/api-football/country-code";
import { normalizeFixtureEvents } from "@/lib/football/providers/api-football/normalize-events";
import type { ApiFootballLiveFixture } from "@/lib/football/providers/api-football/types";

export type LiveFixturesSnapshot = {
  countries: CountryMatchActivity[];
  matchesByCountry: Record<string, LiveMatch[]>;
};

export function buildLiveFixturesSnapshot(
  fixtures: ApiFootballLiveFixture[],
): LiveFixturesSnapshot {
  const matchesByCountry: Record<string, LiveMatch[]> = {};
  const countryCounts = new Map<string, { name: string; liveMatches: number }>();

  for (const fixture of fixtures) {
    const match = normalizeFixture(fixture);
    if (!match) continue;

    const list = matchesByCountry[match.countryCode] ?? [];
    list.push(match);
    matchesByCountry[match.countryCode] = list;

    const existing = countryCounts.get(match.countryCode);
    if (existing) {
      existing.liveMatches += 1;
    } else {
      countryCounts.set(match.countryCode, {
        name: match.country,
        liveMatches: 1,
      });
    }
  }

  for (const code of Object.keys(matchesByCountry)) {
    matchesByCountry[code].sort(sortMatchesByKickoff);
  }

  const countries: CountryMatchActivity[] = [];

  for (const [code, { name, liveMatches }] of countryCounts) {
    const centroid = getCountryCentroid(code);
    if (!centroid) continue;

    countries.push({
      code,
      name,
      latitude: centroid.latitude,
      longitude: centroid.longitude,
      liveMatches,
    });
  }

  return {
    countries: countries.sort((a, b) => b.liveMatches - a.liveMatches),
    matchesByCountry,
  };
}

function resolveCountryCode(fixture: ApiFootballLiveFixture) {
  const catalogEntry = getCatalogEntryForApiLeague(
    fixture.league.id,
    fixture.league.name,
  );

  return (
    countryCodeFromLeagueFlag(fixture.league.flag) ??
    countryCodeFromLeagueCountry(fixture.league.country) ??
    countryCodeFromLeagueFlag(catalogEntry?.countryFlag) ??
    `L${fixture.league.id}`
  );
}

function buildLiveMatch(fixture: ApiFootballLiveFixture, countryCode: string): LiveMatch {
  const catalogEntry = getCatalogEntryForApiLeague(
    fixture.league.id,
    fixture.league.name,
  );
  const halftime = fixture.score?.halftime;
  const homeTeam = fixture.teams.home.name;
  const awayTeam = fixture.teams.away.name;
  /** Regulation/full-time goals; `goals` on PEN fixtures stays 1–1, not shootout tally. */
  const homeGoals =
    fixture.score?.fulltime?.home ?? fixture.score?.extratime?.home ?? fixture.goals.home ?? 0;
  const awayGoals =
    fixture.score?.fulltime?.away ?? fixture.score?.extratime?.away ?? fixture.goals.away ?? 0;

  return {
    id: fixture.fixture.id,
    homeTeamId: fixture.teams.home.id,
    awayTeamId: fixture.teams.away.id,
    leagueId: fixture.league.id,
    homeTeam,
    awayTeam,
    homeGoals,
    awayGoals,
    homeLogo: fixture.teams.home.logo ?? null,
    awayLogo: fixture.teams.away.logo ?? null,
    homeWinner: fixture.teams.home.winner ?? null,
    awayWinner: fixture.teams.away.winner ?? null,
    kickoffAt: fixture.fixture.date ?? null,
    statusShort: fixture.fixture.status.short,
    statusLong: fixture.fixture.status.long,
    elapsed: fixture.fixture.status.elapsed,
    league: fixture.league.name,
    leagueLogo: resolveLeagueLogo(
      fixture.league.id,
      fixture.league.name,
      fixture.league.logo,
    ),
    leagueRound: fixture.league.round?.trim() || null,
    country: fixture.league.country.trim() || countryCode,
    countryCode,
    countryFlag: resolveLeagueFlag(
      fixture.league.id,
      fixture.league.name,
      fixture.league.flag,
      fixture.league.country,
    ),
    venue: formatVenue(fixture.fixture.venue?.name, fixture.fixture.venue?.city),
    venueCity: fixture.fixture.venue?.city?.trim() || null,
    latitude: null,
    longitude: null,
    halftimeHome: halftime?.home ?? null,
    halftimeAway: halftime?.away ?? null,
    events: normalizeFixtureEvents({ homeTeam, awayTeam }, fixture.events),
  };
}

/** Map/catalog snapshot — skips fixtures outside the catalog when no country code is known. */
export function normalizeFixture(fixture: ApiFootballLiveFixture): LiveMatch | null {
  const catalogEntry = getCatalogEntryForApiLeague(
    fixture.league.id,
    fixture.league.name,
  );
  const countryCode =
    countryCodeFromLeagueFlag(fixture.league.flag) ??
    countryCodeFromLeagueCountry(fixture.league.country) ??
    countryCodeFromLeagueFlag(catalogEntry?.countryFlag);
  if (!countryCode) return null;

  return buildLiveMatch(fixture, countryCode);
}

/** Match detail pages — always resolves; not limited to catalog leagues. */
export function normalizeFixtureForMatchDetail(fixture: ApiFootballLiveFixture): LiveMatch {
  return buildLiveMatch(fixture, resolveCountryCode(fixture));
}

function formatVenue(name?: string | null, city?: string | null) {
  if (name && city) return `${name}, ${city}`;
  return name ?? city ?? null;
}

function sortMatchesByKickoff(a: LiveMatch, b: LiveMatch) {
  const aTime = a.kickoffAt ? Date.parse(a.kickoffAt) : Number.MAX_SAFE_INTEGER;
  const bTime = b.kickoffAt ? Date.parse(b.kickoffAt) : Number.MAX_SAFE_INTEGER;
  if (aTime !== bTime) return aTime - bTime;
  return a.league.localeCompare(b.league);
}
