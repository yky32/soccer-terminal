import type { LiveMatch } from "@/lib/data/live-match";
import type { CountryMatchActivity } from "@/lib/data/live-match-countries";
import { getCountryCentroid } from "@/lib/football/country-centroids";
import { countryCodeFromLeagueFlag } from "@/lib/football/providers/api-football/country-code";
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
    matchesByCountry[code].sort((a, b) => a.league.localeCompare(b.league));
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

function normalizeFixture(fixture: ApiFootballLiveFixture): LiveMatch | null {
  const countryCode = countryCodeFromLeagueFlag(fixture.league.flag);
  if (!countryCode) return null;

  const halftime = fixture.score?.halftime;

  return {
    id: fixture.fixture.id,
    homeTeam: fixture.teams.home.name,
    awayTeam: fixture.teams.away.name,
    homeGoals: fixture.goals.home ?? 0,
    awayGoals: fixture.goals.away ?? 0,
    homeLogo: fixture.teams.home.logo ?? null,
    awayLogo: fixture.teams.away.logo ?? null,
    statusShort: fixture.fixture.status.short,
    statusLong: fixture.fixture.status.long,
    elapsed: fixture.fixture.status.elapsed,
    league: fixture.league.name,
    leagueLogo: fixture.league.logo ?? null,
    leagueRound: fixture.league.round?.trim() || null,
    country: fixture.league.country.trim() || countryCode,
    countryCode,
    countryFlag: fixture.league.flag ?? null,
    venue: formatVenue(fixture.fixture.venue?.name, fixture.fixture.venue?.city),
    venueCity: fixture.fixture.venue?.city?.trim() || null,
    latitude: null,
    longitude: null,
    halftimeHome: halftime?.home ?? null,
    halftimeAway: halftime?.away ?? null,
  };
}

function formatVenue(name?: string | null, city?: string | null) {
  if (name && city) return `${name}, ${city}`;
  return name ?? city ?? null;
}
