"use client";

import { FootballPitchSurface } from "@/components/matches/football-pitch-surface";
import { LineupPlayerLink } from "@/components/matches/lineup-player-link";
import {
  LineupPitchAvatarOverlays,
  LineupPitchSubOutIndicator,
  LineupPlayerName,
  LINEUP_PITCH_AVATAR_CLASS,
  PlayerKitNumber,
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
  catalogLeagueId: string | null;
  teamName: string;
  returnTo: string;
  className?: string;
};

function PitchPlayerPin({
  player,
  coords,
  side,
  highlights,
  catalogLeagueId,
  teamName,
  returnTo,
}: {
  player: MatchDetailPlayer;
  coords: { x: number; y: number };
  side: "home" | "away";
  highlights: LineupTeamHighlights;
  catalogLeagueId: string | null;
  teamName: string;
  returnTo: string;
}) {
  const label = shortPlayerName(player.name);
  const highlight = resolvePlayerHighlight(player, highlights);

  const pin = (
    <div
      className={cn(
        "flex w-[18cqw] min-w-[2.5rem] flex-col items-center transition-opacity",
        highlight.subbedOut && "opacity-60",
      )}
      title={lineupPlayerTooltip(player, highlight)}
    >
      <div className="relative">
        {highlight.subbedOut ? (
          <div className="absolute -top-[0.35cqw] left-1/2 z-[3] -translate-x-1/2 -translate-y-full">
            <LineupPitchSubOutIndicator minute={highlight.subOutMinute} />
          </div>
        ) : null}
        <LineupPitchAvatarOverlays player={player} highlight={highlight} />
        <PlayerAvatar
          src={player.photo}
          name={player.name}
          className={LINEUP_PITCH_AVATAR_CLASS}
        />
      </div>
      <p className="mt-[0.35cqw] flex max-w-full justify-center text-center text-[clamp(0.5625rem,2.5cqw,0.75rem)] font-semibold leading-tight text-neutral-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)]">
        <LineupPlayerName
          name={label}
          captain={player.captain}
          align="center"
          captainSize="pitch"
        />
      </p>
      {player.number ? (
        <PlayerKitNumber number={player.number} side={side} size="pitch" className="mt-[0.25cqw]" />
      ) : null}
    </div>
  );

  return (
    <LineupPlayerLink
      catalogLeagueId={catalogLeagueId}
      teamName={teamName}
      playerName={player.name}
      returnTo={returnTo}
      className={cn(
        "absolute z-[1] -translate-x-1/2 -translate-y-1/2 rounded-xl",
        highlight.subbedOut && "opacity-60",
      )}
      style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
    >
      {pin}
    </LineupPlayerLink>
  );
}

export function MatchLineupPitch({
  players,
  side,
  formation,
  highlights,
  catalogLeagueId,
  teamName,
  returnTo,
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
          catalogLeagueId={catalogLeagueId}
          teamName={teamName}
          returnTo={returnTo}
        />
      ))}
    </FootballPitchSurface>
  );
}
