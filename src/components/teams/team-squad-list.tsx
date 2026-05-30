"use client";

import { useState } from "react";
import { FootballLogo } from "@/components/overview/football-logo";
import { leaguesGlassInset } from "@/components/leagues/leagues-glass";
import type { TeamSquadPlayer } from "@/lib/data/team-profile";
import { cn } from "@/lib/utils";

type TeamSquadListProps = {
  squad: TeamSquadPlayer[];
};

const POSITION_ORDER = ["GK", "DEF", "MID", "FWD"] as const;

export function TeamSquadList({ squad }: TeamSquadListProps) {
  const grouped = POSITION_ORDER.map((position) => ({
    position,
    players: squad.filter((player) => player.position === position),
  }));

  return (
    <div className="divide-y divide-black/[0.06]">
      {grouped.map(({ position, players }) =>
        players.length === 0 ? null : (
          <section key={position}>
            <h3 className="px-4 py-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500 sm:px-5">
              {position}
            </h3>
            <ul className="divide-y divide-black/[0.04]">
              {players.map((player) => (
                <li key={player.id}>
                  <SquadRow player={player} />
                </li>
              ))}
            </ul>
          </section>
        ),
      )}
    </div>
  );
}

function SquadRow({ player }: { player: TeamSquadPlayer }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <span className="w-6 shrink-0 text-center text-[0.8125rem] font-bold tabular-nums text-neutral-400">
        {player.number}
      </span>
      <PlayerAvatar src={player.avatar} name={player.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.875rem] font-semibold text-neutral-950">{player.name}</p>
        <p className="mt-0.5 text-[0.75rem] text-neutral-500">
          {player.nationality} · {player.age} yrs
        </p>
      </div>
      <div className="hidden shrink-0 text-right text-[0.75rem] tabular-nums text-neutral-600 sm:block">
        <p>{player.appearances} apps</p>
        <p>
          {player.goals}G · {player.assists}A
        </p>
      </div>
      <span
        className={cn(
          leaguesGlassInset,
          "shrink-0 rounded-md px-1.5 py-0.5 text-[0.75rem] font-bold tabular-nums text-sky-900",
        )}
      >
        {player.rating.toFixed(1)}
      </span>
    </div>
  );
}

function PlayerAvatar({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!src || failed) {
    return (
      <span
        className={cn(
          leaguesGlassInset,
          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold text-neutral-600",
        )}
        aria-hidden
      >
        {initials || "?"}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external Unsplash mock avatars
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-black/[0.08]"
    />
  );
}
