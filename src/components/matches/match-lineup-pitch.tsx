"use client";

import { FootballPitchSurface } from "@/components/matches/football-pitch-surface";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { leaguesGlassInset } from "@/components/leagues/leagues-glass";
import type { MatchDetailPlayer } from "@/lib/data/match-detail";
import {
  layoutLineupOnPitch,
  shortPlayerName,
} from "@/lib/football/lineup-pitch-layout";
import { cn } from "@/lib/utils";

type MatchLineupPitchProps = {
  players: MatchDetailPlayer[];
  side: "home" | "away";
  formation?: string | null;
  className?: string;
};

function PitchPlayerPin({
  player,
  coords,
  side,
}: {
  player: MatchDetailPlayer;
  coords: { x: number; y: number };
  side: "home" | "away";
}) {
  const label = shortPlayerName(player.name);
  return (
    <div
      className="absolute z-[1] flex w-[18cqw] min-w-[2.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
      title={`${player.name}${player.number ? ` · #${player.number}` : ""}${
        player.position ? ` · ${player.position}` : ""
      }${player.rating ? ` · ${player.rating}` : ""}`}
    >
      <div className="relative">
        <PlayerAvatar
          src={player.photo}
          name={player.name}
          className="!size-[10.5cqw] !min-h-7 !min-w-7 ring-2 ring-white shadow-sm"
        />
        {player.rating ? (
          <span className="absolute -bottom-0.5 -right-0.5 flex min-h-3.5 min-w-3.5 items-center justify-center rounded-full bg-white/95 px-[0.35cqw] py-px text-[clamp(0.5rem,2.25cqw,0.6875rem)] font-bold tabular-nums text-neutral-800 shadow-sm ring-1 ring-black/[0.08]">
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
        />
      ))}
    </FootballPitchSurface>
  );
}
