import type { LiveMatch, MatchLiveEvent, MatchEventType } from "@/lib/data/live-match";
import type { ApiFootballFixtureEvent } from "@/lib/football/providers/api-football/types";

function mapEventType(type: string, detail: string): MatchEventType | null {
  if (type === "Goal") return "goal";

  if (type === "Card") {
    if (detail === "Red Card" || detail === "Yellow-Red Card") return "red";
    if (detail === "Yellow Card") return "yellow";
  }

  return null;
}

function eventTeamSide(
  match: Pick<LiveMatch, "homeTeam" | "awayTeam">,
  teamName: string,
): "home" | "away" | null {
  if (teamName === match.homeTeam) return "home";
  if (teamName === match.awayTeam) return "away";
  return null;
}

export function normalizeFixtureEvents(
  match: Pick<LiveMatch, "homeTeam" | "awayTeam">,
  events: ApiFootballFixtureEvent[] | undefined,
): MatchLiveEvent[] {
  if (!events?.length) return [];

  const normalized: MatchLiveEvent[] = [];

  for (const event of events) {
    const type = mapEventType(event.type, event.detail);
    if (!type) continue;

    const team = eventTeamSide(match, event.team.name);
    if (!team) continue;

    normalized.push({
      minute: event.time.elapsed,
      extraMinute: event.time.extra,
      type,
      team,
      detail: event.detail,
    });
  }

  return normalized.sort((a, b) => {
    const aTime = a.minute * 100 + (a.extraMinute ?? 0);
    const bTime = b.minute * 100 + (b.extraMinute ?? 0);
    return aTime - bTime;
  });
}
