"use client";

import { FootballPitchSurface } from "@/components/matches/football-pitch-surface";
import {
  LineupPitchStatOverlay,
  LineupPitchSubOutIndicator,
  lineupRatingClass,
} from "@/components/matches/lineup-player-indicators";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { leaguesGlassInset } from "@/components/leagues/leagues-glass";
import type { MatchDetailPlayer } from "@/lib/data/match-detail";
import {
  layoutLineupOnPitch,
  shortPlayerName,
} from "@/lib/football/lineup-pitch-layout";
import {
  lineupPlayerTooltip,
  resolvePlayerHighlight,
  type LineupTeamHighlights,
} from "@/lib/football/lineup-player-highlights";
import { cn } from "@/lib/utils";

type MatchLineupPitchProps = {
  players: MatchDetailPlayer[];
  side: "home" | "away";
  formation?: string | null;
  highlights: LineupTeamHighlights;
  className?: string;
};

function PitchPlayerPin({
  player,
  coords,
  side,
  highlights,
}: {
  player: MatchDetailPlayer;
  coords: { x: number; y: number };
  side: "home" | "away";
  highlights: LineupTeamHighlights;
}) {
  const label = shortPlayerName(player.name);
  const highlight = resolvePlayerHighlight(player, highlights);

  return (
    <div
      className={cn(
        "absolute z-[1] flex w-[18cqw] min-w-[2.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-opacity",
        highlight.subbedOut && "opacity-60",
      )}
      style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
      title={lineupPlayerTooltip(player, highlight)}
    >
      <div className="relative">
        {highlight.subbedOut ? (
          <div className="absolute -top-[0.35cqw] left-1/2 z-[3] -translate-x-1/2 -translate-y-full">
            <LineupPitchSubOutIndicator minute={highlight.subOutMinute} />
          </div>
        ) : null}
        <LineupPitchStatOverlay player={player} />
        <PlayerAvatar
          src={player.photo}
          name={player.name}
          className={cn(
            "!size-[10.5cqw] !min-h-7 !min-w-7 shadow-sm",
            lineupRatingClass(highlight, true),
          )}
        />
        {player.rating ? (
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 flex min-h-3.5 min-w-3.5 items-center justify-center rounded-full px-[0.35cqw] py-px text-[clamp(0.5rem,2.25cqw,0.6875rem)] font-bold tabular-nums shadow-sm ring-1",
              highlight.topRating
                ? "bg-amber-100 text-amber-950 ring-amber-400/50"
                : "bg-white/95 text-neutral-800 ring-black/[0.08]",
            )}
          >
            {player.rating}
          </span>
        ) : null}
      </div>
      <p className="mt-[0.35cqw] max-w-full truncate text-center text-[clamp(0.5625rem,2.5cqw,0.75rem)] font-semibold leading-tight text-neutral-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)]">
        {label}
      </p>
      {player.number ? (
        <span
          className={cn(
            "mt-[0.25cqw] text-[clamp(0.5rem,2.1cqw,0.6875rem)] font-bold tabular-nums",
            side === "home" ? "text-emerald-800" : "text-sky-800",
          )}
        >
          #{player.number}
        </span>
      ) : null}
    </div>
  );
}

export function MatchLineupPitch({
  players,
  side,
  formation,
  highlights,
  className,
}: MatchLineupPitchProps) {
  const placed = layoutLineupOnPitch(players, side, formation);

  if (placed.length === 0) {
    return (
      <div
        className={cn(
          leaguesGlassInset,
          "flex min-h-[15.5rem] items-center justify-center rounded-xl px-4 py-8 text-center",
          className,
        )}
      >
        <p className="text-[0.8125rem] text-neutral-500">Starting XI not available.</p>
      </div>
    );
  }

  return (
    <FootballPitchSurface className={className}>
      {placed.map(({ player, coords }) => (
        <PitchPlayerPin
          key={`${player.id ?? player.name}-${player.number ?? "x"}`}
          player={player}
          coords={coords}
          side={side}
          highlights={highlights}
        />
      ))}
    </FootballPitchSurface>
  );
}
