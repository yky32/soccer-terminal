import type { MatchDetail } from "@/lib/data/match-detail";
import type { TeamProfile } from "@/lib/data/team-profile";
import type { LeagueCatalogEntry } from "@/lib/football/league-catalog";
import { LEAGUE_TIER_LABELS } from "@/lib/data/league-profile";
import { isMatchLive } from "@/lib/match-monitor";
import { formatKickoffDateForSeo } from "@/lib/seo/detail-metadata";

const FINISHED = new Set(["FT", "AET", "PEN", "AWD", "WO"]);

export function buildMatchPageIntro(detail: MatchDetail): string[] {
  const { match } = detail;
  const venuePart = match.venue
    ? ` at ${match.venue}${match.venueCity ? `, ${match.venueCity}` : ""}`
    : "";

  const lead = (() => {
    if (isMatchLive(match)) {
      return `${match.homeTeam} lead ${match.homeGoals}–${match.awayGoals} against ${match.awayTeam}${
        match.elapsed !== null ? ` (${match.elapsed}')` : ""
      } in ${match.league}.`;
    }
    if (FINISHED.has(match.statusShort)) {
      return `${match.homeTeam} ${match.homeGoals}–${match.awayGoals} ${match.awayTeam} — full time in ${match.league}.`;
    }
    if (match.kickoffAt) {
      return `${match.homeTeam} vs ${match.awayTeam}${venuePart} — kickoff ${formatKickoffDateForSeo(match.kickoffAt)} UTC, ${match.league}.`;
    }
    return `${match.homeTeam} vs ${match.awayTeam} in ${match.league}${venuePart}.`;
  })();

  return [
    lead,
    "On Soccer Terminal, follow live score updates, confirmed lineups, match stats, timeline events, and head-to-head history in one place.",
    "Soccer Terminal covers leagues worldwide with an interactive global map, league dashboards, and deep links to teams and players.",
  ];
}

export function buildTeamPageIntro(team: TeamProfile): string[] {
  const { club } = team;

  return [
    `${team.name} is a football club based in ${club.city}, ${club.country}, playing home matches at ${club.stadium}.`,
    `Follow ${team.name} on Soccer Terminal for ${team.league.name} standings, recent form, upcoming fixtures, squad list, and player stat leaders.`,
    `Currently ${team.standing.rank}${ordinalSuffix(team.standing.rank)} in ${team.league.shortName} with ${team.standing.points} points from ${team.standing.played} matches played.`,
  ];
}

export function buildLeaguePageIntro(entry: LeagueCatalogEntry): string[] {
  const tier = LEAGUE_TIER_LABELS[entry.tier].toLowerCase();

  return [
    `${entry.name} (${entry.country}) — live standings, fixtures, and team profiles on Soccer Terminal.`,
    `Browse the ${tier} ${entry.shortName} table, upcoming matches, squad leaders, and quick links into the global live map.`,
    "Soccer Terminal brings league dashboards and match monitoring together for fans who want more context than a basic fixture list.",
  ];
}

function ordinalSuffix(value: number) {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  switch (value % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
