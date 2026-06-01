import type { LiveMatch } from "@/lib/data/live-match";
import { normalizeFixtureEvents } from "@/lib/football/providers/api-football/normalize-events";
import { apiFootballGetSafe } from "@/lib/football/providers/api-football/request";
import type { ApiFootballLiveFixture } from "@/lib/football/providers/api-football/types";

const IDS_CHUNK = 20;
const MAX_EVENT_BATCHES = 2;

function chunkFixtureIds(ids: number[]) {
  const chunks: number[][] = [];

  for (let index = 0; index < ids.length; index += IDS_CHUNK) {
    chunks.push(ids.slice(index, index + IDS_CHUNK));
  }

  return chunks;
}

function eventsByFixtureId(fixtures: ApiFootballLiveFixture[]) {
  const map = new Map<number, LiveMatch["events"]>();

  for (const fixture of fixtures) {
    const homeTeam = fixture.teams.home.name;
    const awayTeam = fixture.teams.away.name;
    map.set(
      fixture.fixture.id,
      normalizeFixtureEvents({ homeTeam, awayTeam }, fixture.events),
    );
  }

  return map;
}

export async function enrichMatchesWithEvents(
  matchesByCountry: Record<string, LiveMatch[]>,
  apiKey: string,
): Promise<Record<string, LiveMatch[]>> {
  const ids = [
    ...new Set(
      Object.values(matchesByCountry)
        .flat()
        .map((match) => match.id),
    ),
  ];

  if (ids.length === 0) return matchesByCountry;

  const batches = chunkFixtureIds(ids).slice(0, MAX_EVENT_BATCHES);
  const fixtures: ApiFootballLiveFixture[] = [];

  for (const chunk of batches) {
    fixtures.push(
      ...(await apiFootballGetSafe<ApiFootballLiveFixture>(
        apiKey,
        "/fixtures",
        { ids: chunk.join("-") },
        60,
      )),
    );
  }

  const eventMap = eventsByFixtureId(fixtures);
  const enriched: Record<string, LiveMatch[]> = {};

  for (const [code, matches] of Object.entries(matchesByCountry)) {
    enriched[code] = matches.map((match) => ({
      ...match,
      events: eventMap.get(match.id) ?? match.events,
    }));
  }

  return enriched;
}
