"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

import { FOOTBALL_PITCH_VIEWBOX } from "@/lib/football/pitch-viewbox";

const PITCH = {
  x: FOOTBALL_PITCH_VIEWBOX.pitch.x,
  y: FOOTBALL_PITCH_VIEWBOX.pitch.y,
  w: FOOTBALL_PITCH_VIEWBOX.pitch.w,
  h: FOOTBALL_PITCH_VIEWBOX.pitch.h,
  cx: 50,
  cy: 70,
} as const;
const LINE = "rgba(255,255,255,0.82)";

type FootballPitchSurfaceProps = {
  children?: ReactNode;
  className?: string;
  overlayClassName?: string;
};

export function FootballPitchSurface({
  children,
  className,
  overlayClassName,
}: FootballPitchSurfaceProps) {
  const uid = useId().replace(/:/g, "");
  const grassId = `pitch-grass-${uid}`;
  const stripeId = `pitch-stripes-${uid}`;

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[22rem] sm:max-w-[26rem] lg:max-w-full",
        className,
      )}
    >
      <div className="@container/pitch relative aspect-[5/7] w-full min-h-[15.5rem] sm:min-h-[17.5rem]">
        <svg
          viewBox="0 0 100 140"
          className="h-full w-full drop-shadow-[0_8px_24px_rgba(16,185,129,0.18)]"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <linearGradient id={grassId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8f0d0" />
              <stop offset="45%" stopColor="#b3e6be" />
              <stop offset="100%" stopColor="#9fd9ad" />
            </linearGradient>
            <pattern id={stripeId} patternUnits="userSpaceOnUse" width="100" height="14">
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
        </svg>

        {children ? (
          <div className={cn("absolute inset-0", overlayClassName)}>{children}</div>
        ) : null}
      </div>
    </div>
  );
}
