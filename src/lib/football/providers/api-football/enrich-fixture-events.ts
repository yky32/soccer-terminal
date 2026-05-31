import type { LiveMatch } from "@/lib/data/live-match";
import { apiRequest } from "@/lib/http/api-client";
import { normalizeFixtureEvents } from "@/lib/football/providers/api-football/normalize-events";
import type {
  ApiFootballLiveFixture,
  ApiFootballLiveResponse,
} from "@/lib/football/providers/api-football/types";

const API_BASE = "https://v3.football.api-sports.io";
const IDS_CHUNK = 20;

function chunkFixtureIds(ids: number[]) {
  const chunks: number[][] = [];

  for (let index = 0; index < ids.length; index += IDS_CHUNK) {
    chunks.push(ids.slice(index, index + IDS_CHUNK));
  }

  return chunks;
}

async function fetchFixturesByIds(apiKey: string, ids: number[]) {
  if (ids.length === 0) return [];

  const { data } = await apiRequest<ApiFootballLiveResponse>({
    scope: "server",
    provider: "api-football",
    method: "GET",
    url: `${API_BASE}/fixtures`,
    query: { ids: ids.join("-") },
    headers: {
      "x-apisports-key": apiKey,
    },
    next: { revalidate: 60 },
  });

  return data.response ?? [];
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

  const batches = await Promise.all(
    chunkFixtureIds(ids).map((chunk) => fetchFixturesByIds(apiKey, chunk)),
  );
  const eventMap = eventsByFixtureId(batches.flat());

  const enriched: Record<string, LiveMatch[]> = {};

  for (const [code, matches] of Object.entries(matchesByCountry)) {
    enriched[code] = matches.map((match) => ({
      ...match,
      events: eventMap.get(match.id) ?? match.events,
    }));
  }

  return enriched;
}
