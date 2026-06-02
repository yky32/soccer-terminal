"use client";

import Link from "next/link";
import { fixtureDetailHref } from "@/lib/match-paths";
import { FootballLogo } from "@/components/overview/football-logo";
import {
  leaguesGlassInset,
  leaguesGlassInsetBar,
  leaguesGlassStrong,
} from "@/components/leagues/leagues-glass";
import type { TeamProfile } from "@/lib/data/team-profile";
import type { LeagueFixture } from "@/lib/data/league-profile";
import { cn } from "@/lib/utils";

type TeamHeroProps = {
  team: TeamProfile;
};

export function TeamHero({ team }: TeamHeroProps) {
  const gd = team.standing.goalsFor - team.standing.goalsAgainst;

  return (
    <div className={cn(leaguesGlassStrong, "overflow-hidden")}>
      <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <FootballLogo
            src={team.logo}
            label={team.name}
            size="lg"
            className="h-12 w-12 sm:h-14 sm:w-14"
          />
          <div className="min-w-0">
            <Link
              href="/leagues"
              className="text-[0.8125rem] font-medium text-neutral-500 transition-colors hover:text-neutral-800"
            >
              {team.league.name}
            </Link>
            <h1 className="mt-0.5 text-[clamp(1.375rem,3vw,1.875rem)] font-semibold leading-tight tracking-[-0.03em] text-neutral-950">
              {team.name}
            </h1>
            <p className="mt-1 text-[0.875rem] text-neutral-600">
              {team.league.season} · {team.standing.rank}
              {ordinal(team.standing.rank)} · {team.standing.points} pts
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              leaguesGlassInset,
              "rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-600",
            )}
          >
            {team.club.country}
          </span>
          <span
            className={cn(
              leaguesGlassInset,
              "rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-600",
            )}
          >
            {team.coach.name}
          </span>
        </div>
      </div>

      <div
        className={cn(
          leaguesGlassInsetBar,
          "grid grid-cols-2 divide-x divide-black/[0.06] border-t border-black/[0.06] sm:grid-cols-4",
        )}
      >
        <HeroStat label="Played" value={String(team.standing.played)} />
        <HeroStat
          label="Record"
          value={`${team.standing.won}W ${team.standing.drawn}D ${team.standing.lost}L`}
        />
        <HeroStat label="Goal diff" value={gd > 0 ? `+${gd}` : String(gd)} />
        <HeroStat label="Win rate" value={`${team.coach.winRate}%`} />
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3 text-center sm:px-5">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        {label}
      </p>
      <p className="mt-0.5 text-[0.9375rem] font-bold tabular-nums tracking-[-0.02em] text-neutral-950 sm:text-[1rem]">
        {value}
      </p>
    </div>
  );
}

function ordinal(value: number) {
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

export function TeamFormStrip({ team }: { team: TeamProfile }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {team.formMatches.map((match, index) => (
        <div
          key={`${match.opponent}-${index}`}
          className={cn(
            leaguesGlassInset,
            "flex min-w-[5.75rem] shrink-0 flex-col items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-center",
          )}
        >
          <FootballLogo src={match.opponentLogo} label={match.opponent} size="sm" />
          <p className="w-full truncate text-[0.6875rem] font-medium text-neutral-700">
            {match.isHome ? "vs" : "@"} {match.opponent}
          </p>
          <span
            className={cn(
              "inline-flex h-6 min-w-6 items-center justify-center rounded px-1 text-[0.6875rem] font-bold",
              match.result === "W" && "bg-emerald-500/15 text-emerald-800",
              match.result === "D" && "bg-neutral-500/10 text-neutral-600",
              match.result === "L" && "bg-rose-500/10 text-rose-700",
            )}
          >
            {match.result}
          </span>
          <p className="text-[0.75rem] font-semibold tabular-nums text-neutral-900">
            {match.teamScore}–{match.opponentScore}
          </p>
        </div>
      ))}
    </div>
  );
}

export function TeamUpcomingStrip({ team }: { team: TeamProfile }) {
  const fixtures = team.upcomingFixtures.slice(0, 5);

  if (fixtures.length === 0) {
    return (
      <p className="py-6 text-center text-[0.8125rem] text-neutral-500">
        No upcoming fixtures scheduled.
      </p>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {fixtures.map((fixture) => (
        <UpcomingMatchCard key={fixture.id} fixture={fixture} teamName={team.name} />
      ))}
    </div>
  );
}

function UpcomingMatchCard({
  fixture,
  teamName,
}: {
  fixture: LeagueFixture;
  teamName: string;
}) {
  const kickoff = new Date(fixture.kickoffAt);
  const isHome = fixture.homeTeam === teamName;
  const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;
  const opponentLogo = isHome ? fixture.awayLogo : fixture.homeLogo;
  const isSoon = kickoff.getTime() - Date.now() < 48 * 3_600_000;
  const detailHref = fixtureDetailHref(fixture);

  const content = (
    <>
      <FootballLogo src={opponentLogo} label={opponent} size="sm" />
      <p className="w-full truncate text-[0.6875rem] font-medium text-neutral-700">
        {isHome ? "vs" : "@"} {opponent}
      </p>
      <span
        className={cn(
          "inline-flex rounded px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.06em]",
          isSoon ? "bg-sky-500/10 text-sky-800" : "bg-neutral-500/10 text-neutral-600",
        )}
      >
        {fixture.matchday}
      </span>
      <p className="text-[0.6875rem] font-medium tabular-nums text-neutral-700">
        {kickoff.toLocaleDateString([], { month: "short", day: "numeric" })}
      </p>
      <p className="text-[0.6875rem] tabular-nums text-neutral-500">
        {kickoff.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>
    </>
  );

  if (!detailHref) {
    return (
      <div
        className={cn(
          leaguesGlassInset,
          "flex min-w-[5.75rem] shrink-0 flex-col items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-center",
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={detailHref}
      className={cn(
        leaguesGlassInset,
        "flex min-w-[5.75rem] shrink-0 cursor-pointer flex-col items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-center transition-opacity hover:opacity-95",
      )}
    >
      {content}
    </Link>
  );
}

export function TeamLeagueLink({ team }: { team: TeamProfile }) {
  return (
    <Link
      href="/leagues"
      className="text-[0.8125rem] font-medium text-sky-800 hover:text-sky-950"
    >
      View {team.league.shortName} dashboard
    </Link>
  );
}
