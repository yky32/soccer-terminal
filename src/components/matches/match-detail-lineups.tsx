import { ArrowUp } from "lucide-react";
import { FootballLogo } from "@/components/overview/football-logo";
import { MatchLineupPitch } from "@/components/matches/match-lineup-pitch";
import {
  groupByLineupPosition,
  LineupPositionRowHeader,
} from "@/components/matches/lineup-position-style";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { leaguesGlass, leaguesGlassInset } from "@/components/leagues/leagues-glass";
import type { MatchDetailLineupSide, MatchDetailPlayer } from "@/lib/data/match-detail";
import { shortPlayerName } from "@/lib/football/lineup-pitch-layout";
import { cn } from "@/lib/utils";

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-neutral-500">
      {children}
    </h2>
  );
}

function substitutePlayed(player: MatchDetailPlayer) {
  if (player.minutes != null && player.minutes > 0) return true;
  return Boolean(player.rating?.trim());
}

function SubInIndicator({ minutes }: { minutes: number | null }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[0.625rem] font-semibold leading-none text-emerald-700 ring-1 ring-emerald-500/20">
      <ArrowUp className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
      Sub in
      {minutes != null && minutes > 0 ? (
        <span className="font-medium text-emerald-600/90">{minutes}&apos;</span>
      ) : null}
    </span>
  );
}

function SubstituteChip({ player }: { player: MatchDetailPlayer }) {
  const played = substitutePlayed(player);

  return (
    <div
      className={cn(
        leaguesGlassInset,
        "flex items-start gap-2.5 rounded-xl px-2.5 py-2 transition-colors",
        played && "bg-black/[0.05] ring-1 ring-emerald-500/15",
      )}
      title={
        played
          ? `${player.name} · Subbed on${player.minutes ? ` · ${player.minutes} min` : ""}${
              player.rating ? ` · ${player.rating}` : ""
            }`
          : player.name
      }
    >
      <PlayerAvatar src={player.photo} name={player.name} size="sm" className="!h-8 !w-8" />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-[0.75rem] font-semibold leading-tight text-neutral-900">
            {shortPlayerName(player.name)}
          </p>
          {player.rating ? (
            <span className="shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-[0.6875rem] font-bold tabular-nums text-neutral-800">
              {player.rating}
            </span>
          ) : null}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {player.number ? (
            <span className="text-[0.6875rem] font-medium tabular-nums text-neutral-500">
              #{player.number}
            </span>
          ) : null}
          {played ? <SubInIndicator minutes={player.minutes} /> : null}
        </div>
      </div>
    </div>
  );
}

function SubstitutesBench({ players }: { players: MatchDetailPlayer[] }) {
  if (players.length === 0) return null;

  const groups = groupByLineupPosition(players);

  return (
    <div className="mt-3 border-t border-black/[0.06] pt-3">
      <p className="text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-neutral-500">
        Substitutes
      </p>
      <div className="mt-3 space-y-3">
        {groups.map((group) => (
          <div key={group.kind}>
            <LineupPositionRowHeader kind={group.kind} className="mb-1.5" />
            <div className="grid grid-cols-2 gap-2">
              {group.players.map((player, index) => (
                <SubstituteChip
                  key={`${group.kind}-${player.id ?? player.name}-${player.number ?? index}`}
                  player={player}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamFormationColumn({
  lineup,
  side,
}: {
  lineup: MatchDetailLineupSide;
  side: "home" | "away";
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <FootballLogo src={lineup.teamLogo} label={lineup.team} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-[0.8125rem] font-semibold text-neutral-950">
            {lineup.team}
          </p>
          <p className="text-[0.75rem] text-neutral-500">
            {lineup.formation ?? "—"}
            {lineup.coach ? ` · ${lineup.coach}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-3 flex justify-center px-0.5 py-2 sm:px-1">
        <MatchLineupPitch
          players={lineup.starting}
          side={side}
          formation={lineup.formation}
          className="w-full"
        />
      </div>

      <SubstitutesBench players={lineup.substitutes} />
    </div>
  );
}

export function MatchDetailLineups({
  lineups,
}: {
  lineups: {
    home: MatchDetailLineupSide | null;
    away: MatchDetailLineupSide | null;
  };
}) {
  return (
    <section className={cn(leaguesGlass, "overflow-hidden")} aria-label="Formation">
      <div className="space-y-4 p-5 sm:p-6">
        <SectionHeading>Formation</SectionHeading>

        {!lineups.home && !lineups.away ? (
          <p className="py-6 text-center text-[0.875rem] text-neutral-500">
            Lineups are not published yet.
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-0">
            {lineups.home ? (
              <div
                className={cn(
                  "min-w-0",
                  lineups.away && "lg:pr-5 lg:border-r lg:border-black/[0.06]",
                )}
              >
                <TeamFormationColumn lineup={lineups.home} side="home" />
              </div>
            ) : null}

            {lineups.away ? (
              <div className={cn("min-w-0", lineups.home && "lg:pl-5")}>
                <TeamFormationColumn lineup={lineups.away} side="away" />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
