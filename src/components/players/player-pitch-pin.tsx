"use client";

import type { PlayerProfile } from "@/lib/data/player-profile";
import { PositionIcon } from "@/components/players/position-icon";
import { cn } from "@/lib/utils";

type PlayerPitchPinProps = {
  player: PlayerProfile;
  className?: string;
};

const ROLE_COORDS: Record<string, { x: number; y: number }> = {
  Goalkeeper: { x: 50, y: 91 },
  "Centre-Back": { x: 50, y: 76 },
  "Left-Back": { x: 16, y: 74 },
  "Right-Back": { x: 84, y: 74 },
  "Defensive Midfield": { x: 50, y: 62 },
  "Central Midfield": { x: 50, y: 50 },
  "Attacking Midfield": { x: 50, y: 38 },
  "Centre-Forward": { x: 50, y: 17 },
  "Left Winger": { x: 14, y: 26 },
  "Right Winger": { x: 86, y: 26 },
  "Second Striker": { x: 50, y: 26 },
};

const PRIMARY_FALLBACK: Record<string, { x: number; y: number }> = {
  GK: { x: 50, y: 91 },
  DEF: { x: 50, y: 76 },
  MID: { x: 50, y: 50 },
  FWD: { x: 50, y: 18 },
};

function pinCoords(player: PlayerProfile) {
  return (
    ROLE_COORDS[player.position.role] ??
    PRIMARY_FALLBACK[player.position.primary] ?? { x: 50, y: 50 }
  );
}

function pinStyle(x: number, y: number) {
  const left = 8 + (x / 100) * 84;
  const top = 6 + (y / 100) * 128;
  return { left: `${left}%`, top: `${(top / 140) * 100}%` };
}

export function PlayerPitchPin({ player, className }: PlayerPitchPinProps) {
  const pin = pinCoords(player);
  const style = pinStyle(pin.x, pin.y);

  return (
    <div className={cn("relative h-full min-h-[180px] w-full overflow-hidden", className)}>
      <svg
        viewBox="0 0 100 140"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <linearGradient id="pitch-grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d8f52" />
            <stop offset="100%" stopColor="#2f7341" />
          </linearGradient>
        </defs>

        <rect x="8" y="6" width="84" height="128" rx="2" fill="url(#pitch-grass)" />
        <rect
          x="8"
          y="6"
          width="84"
          height="128"
          rx="2"
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="0.75"
        />

        <line x1="8" y1="70" x2="92" y2="70" stroke="rgba(255,255,255,0.45)" strokeWidth="0.6" />
        <circle
          cx="50"
          cy="70"
          r="9"
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="0.6"
        />
        <circle cx="50" cy="70" r="0.8" fill="rgba(255,255,255,0.65)" />

        <rect
          x="24"
          y="6"
          width="52"
          height="22"
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="0.6"
        />
        <rect
          x="34"
          y="6"
          width="32"
          height="8"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.5"
        />

        <rect
          x="24"
          y="112"
          width="52"
          height="22"
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="0.6"
        />
        <rect
          x="34"
          y="128"
          width="32"
          height="8"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.5"
        />
      </svg>

      <div
        className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
        style={style}
      >
        <div className="relative flex h-7 w-7 items-center justify-center">
          <span
            className="absolute h-3 w-3 rounded-full bg-sky-400 ring-2 ring-white shadow-md"
            aria-hidden
          />
          <span className="absolute -bottom-2 h-0 w-0 border-x-[5px] border-x-transparent border-t-[7px] border-t-sky-500" />
        </div>
        <span className="mt-1 inline-flex max-w-[4.5rem] items-center gap-0.5 truncate rounded-full bg-white/90 px-1.5 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.04em] text-neutral-800 shadow-sm">
          <PositionIcon
            primary={player.position.primary}
            role={player.position.role}
            className="h-2.5 w-2.5 text-neutral-600"
          />
          {player.position.primary}
        </span>
      </div>
    </div>
  );
}
