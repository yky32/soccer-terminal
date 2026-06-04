import type { LiveMatch } from "@/lib/data/live-match";
import type { MatchDetail } from "@/lib/data/match-detail";
import type { PlayerSlugMatch } from "@/lib/football/provider";
import type { TeamProfile } from "@/lib/data/team-profile";
import { isMatchLive } from "@/lib/match-monitor";

const FINISHED_STATUSES = new Set(["FT", "AET", "PEN", "AWD", "WO"]);

function formatKickoffDate(iso: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function formatKickoffDateForSeo(iso: string) {
  return formatKickoffDate(iso);
}

export function formatMatchPageTitle(match: LiveMatch) {
  if (isMatchLive(match)) {
    return `${match.homeTeam} ${match.homeGoals}–${match.awayGoals} ${match.awayTeam} - Live Score`;
  }

  if (FINISHED_STATUSES.has(match.statusShort)) {
    return `${match.homeTeam} ${match.homeGoals}–${match.awayGoals} ${match.awayTeam} - Match Result`;
  }

  return `${match.homeTeam} vs ${match.awayTeam} - Live Score & Stats`;
}

export function formatMatchPageDescription(detail: MatchDetail) {
  const { match } = detail;
  const parts: string[] = [match.league];

  if (isMatchLive(match)) {
    parts.push(
      `Live: ${match.homeGoals}–${match.awayGoals}${
        match.elapsed !== null ? ` (${match.elapsed}')` : ""
      }.`,
    );
  } else if (FINISHED_STATUSES.has(match.statusShort)) {
    parts.push(`Final score ${match.homeGoals}–${match.awayGoals}.`);
  } else if (match.kickoffAt) {
    parts.push(`Kickoff ${formatKickoffDate(match.kickoffAt)} UTC.`);
  }

  parts.push("Lineups, stats, timeline, and head-to-head.");

  if (match.venue) {
    parts.push(`Venue: ${match.venue}${match.venueCity ? `, ${match.venueCity}` : ""}.`);
  }

  return parts.join(" ");
}

export function formatTeamPageTitle(team: TeamProfile) {
  return `${team.name} - Fixtures, Squad & Stats`;
}

export function formatTeamPageDescription(team: TeamProfile) {
  const { standing } = team;
  return [
    `${team.name} in ${team.league.name}.`,
    `Table: #${standing.rank} with ${standing.points} points (${standing.played} played).`,
    "Squad, fixtures, form, and results.",
  ].join(" ");
}

export function formatPlayerPageTitle(match: PlayerSlugMatch) {
  return `${match.name} · ${match.standing.team} · ${match.league.shortName}`;
}

export function formatPlayerPageDescription(match: PlayerSlugMatch) {
  const { standing } = match;
  return [
    `${match.name} (${match.standing.team}) in ${match.league.name}.`,
    `League position #${standing.rank} — ${standing.points} pts.`,
    "Player profile, stats, and recent match performance.",
  ].join(" ");
}

export function formatLeaguePageTitle(name: string) {
  return `${name} - Standings, Fixtures & Teams`;
}

export function formatLeaguePageDescription(entry: {
  name: string;
  country: string;
  shortName: string;
}) {
  return `${entry.name} (${entry.country}) standings, fixtures, teams, and stat leaders — ${entry.shortName} dashboard on Soccer Terminal.`;
}
