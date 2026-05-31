"use client";

import { useId } from "react";
import {
  resolvePositionKind,
  type PositionKind,
} from "@/components/players/position-icon";
import type { PlayerProfile } from "@/lib/data/player-profile";
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

const PITCH = { x: 10, y: 8, w: 80, h: 124, cx: 50, cy: 70 } as const;
const LINE = "rgba(255,255,255,0.82)";

const POSITION_STYLE: Record<
  PositionKind,
  { pin: string; ping: string; label: string; shadow: string }
> = {
  goalkeeper: {
    pin: "bg-amber-400",
    ping: "bg-amber-400/50",
    label: "bg-amber-100 text-amber-900 ring-amber-200/80",
    shadow: "shadow-[0_4px_14px_rgba(245,158,11,0.45)]",
  },
  defender: {
    pin: "bg-sky-400",
    ping: "bg-sky-400/50",
    label: "bg-sky-100 text-sky-900 ring-sky-200/80",
    shadow: "shadow-[0_4px_14px_rgba(56,189,248,0.45)]",
  },
  midfielder: {
    pin: "bg-emerald-400",
    ping: "bg-emerald-400/50",
    label: "bg-emerald-100 text-emerald-900 ring-emerald-200/80",
    shadow: "shadow-[0_4px_14px_rgba(52,211,153,0.45)]",
  },
  forward: {
    pin: "bg-rose-400",
    ping: "bg-rose-400/50",
    label: "bg-rose-100 text-rose-900 ring-rose-200/80",
    shadow: "shadow-[0_4px_14px_rgba(251,113,133,0.45)]",
  },
};

const DEFAULT_STYLE = POSITION_STYLE.midfielder;

function pinCoords(player: PlayerProfile) {
  return (
    ROLE_COORDS[player.position.role] ??
    PRIMARY_FALLBACK[player.position.primary] ?? { x: 50, y: 50 }
  );
}

function pinStyle(x: number, y: number) {
  const left = PITCH.x + (x / 100) * PITCH.w;
  const top = PITCH.y + (y / 100) * PITCH.h;
  return { left: `${left}%`, top: `${(top / 140) * 100}%` };
}

function resolvePositionStyle(player: PlayerProfile) {
  const kind = resolvePositionKind(player.position.primary, player.position.role);
  return kind ? POSITION_STYLE[kind] : DEFAULT_STYLE;
}

export function PlayerPitchPin({ player, className }: PlayerPitchPinProps) {
  const uid = useId().replace(/:/g, "");
  const pin = pinCoords(player);
  const style = pinStyle(pin.x, pin.y);
  const accent = resolvePositionStyle(player);
  const grassId = `pitch-grass-${uid}`;
  const stripeId = `pitch-stripes-${uid}`;

  return (
    <div
      className={cn(
        "relative flex h-full min-h-[160px] w-full items-center justify-center overflow-hidden px-3 py-4 sm:px-4",
        className,
      )}
    >
      <div className="relative aspect-[5/7] h-full max-h-full w-full max-w-[11.5rem] -rotate-1 sm:max-w-[13rem] sm:rotate-0">
        <svg
          viewBox="0 0 100 140"
          className="h-full w-full drop-shadow-[0_8px_24px_rgba(16,185,129,0.22)]"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <linearGradient id={grassId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8f0d0" />
              <stop offset="45%" stopColor="#b3e6be" />
              <stop offset="100%" stopColor="#9fd9ad" />
            </linearGradient>
            <pattern
              id={stripeId}
              patternUnits="userSpaceOnUse"
              width="100"
              height="14"
            >
              <rect width="100" height="7" fill="rgba(255,255,255,0.18)" />
              <rect y="7" width="100" height="7" fill="rgba(0,0,0,0.04)" />
            </pattern>
          </defs>

          <rect
            x={PITCH.x}
            y={PITCH.y}
            width={PITCH.w}
            height={PITCH.h}
            rx="5"
            fill={`url(#${grassId})`}
          />
          <rect
            x={PITCH.x}
            y={PITCH.y}
            width={PITCH.w}
            height={PITCH.h}
            rx="5"
            fill={`url(#${stripeId})`}
            opacity="0.75"
          />
          <rect
            x={PITCH.x}
            y={PITCH.y}
            width={PITCH.w}
            height={PITCH.h}
            rx="5"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1.1"
          />

          <line
            x1={PITCH.x}
            y1={PITCH.cy}
            x2={PITCH.x + PITCH.w}
            y2={PITCH.cy}
            stroke={LINE}
            strokeWidth="0.85"
          />
          <circle
            cx={PITCH.cx}
            cy={PITCH.cy}
            r="9.5"
            fill="none"
            stroke={LINE}
            strokeWidth="0.75"
          />
          <circle cx={PITCH.cx} cy={PITCH.cy} r="1" fill={LINE} />

          <rect
            x="26"
            y={PITCH.y}
            width="48"
            height="20"
            fill="none"
            stroke={LINE}
            strokeWidth="0.75"
          />
          <rect
            x="34"
            y={PITCH.y}
            width="32"
            height="7"
            fill="none"
            stroke={LINE}
            strokeWidth="0.6"
          />

          <rect
            x="26"
            y="112"
            width="48"
            height="20"
            fill="none"
            stroke={LINE}
            strokeWidth="0.75"
          />
          <rect
            x="34"
            y="125"
            width="32"
            height="7"
            fill="none"
            stroke={LINE}
            strokeWidth="0.6"
          />

          <path
            d={`M ${PITCH.cx - 9} ${PITCH.y} A 9 9 0 0 0 ${PITCH.cx + 9} ${PITCH.y}`}
            fill="none"
            stroke={LINE}
            strokeWidth="0.6"
          />
          <path
            d={`M ${PITCH.cx - 9} 132 A 9 9 0 0 1 ${PITCH.cx + 9} 132`}
            fill="none"
            stroke={LINE}
            strokeWidth="0.6"
          />

          <circle cx="14" cy="18" r="1.2" fill="rgba(255,255,255,0.5)" />
          <circle cx="86" cy="122" r="1.2" fill="rgba(255,255,255,0.5)" />
        </svg>

        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={style}
        >
          <div className="pitch-pin-enter flex flex-col items-center">
            <div className="pitch-pin-bob flex flex-col items-center">
              <span className="relative flex h-4 w-4 items-center justify-center">
                <span
                  className={cn(
                    "absolute inset-0 rounded-full opacity-70 live-pin-ping",
                    accent.ping,
                  )}
                  aria-hidden
                />
                <span
                  className={cn(
                    "relative h-4 w-4 rounded-full ring-[3px] ring-white",
                    accent.pin,
                    accent.shadow,
                  )}
                  aria-hidden
                />
              </span>
              <span
                className={cn(
                  "mt-2 rounded-full px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.06em] ring-1",
                  accent.label,
                )}
              >
                {player.position.primary}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
