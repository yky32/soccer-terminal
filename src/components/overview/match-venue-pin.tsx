"use client";

import { MapMarker, MarkerContent, MarkerTooltip } from "@/components/ui/map";
import type { LiveMatch } from "@/lib/data/live-match";
import type { MapMatchMode } from "@/lib/data/map-match-mode";
import { getMatchPinColor } from "@/lib/football/match-pin-colors";

type MatchVenuePinProps = {
  match: LiveMatch;
  colorIndex: number;
  mode?: MapMatchMode;
  pulseDelay?: number;
};

function kickoffShort(kickoffAt: string | null) {
  if (!kickoffAt) return "TBD";
  const date = new Date(kickoffAt);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MatchVenuePin({
  match,
  colorIndex,
  mode = "live",
  pulseDelay = 0,
}: MatchVenuePinProps) {
  if (match.latitude === null || match.longitude === null) return null;

  const color = getMatchPinColor(colorIndex);
  const isFuture = mode === "future";

  return (
    <MapMarker longitude={match.longitude} latitude={match.latitude}>
      <MarkerContent>
        <div className="relative flex h-5 w-5 items-center justify-center">
          {!isFuture ? (
            <>
              <span
                className="live-pin-ping absolute inset-0 rounded-full"
                style={{
                  backgroundColor: color.ping,
                  animationDelay: `${pulseDelay}s`,
                }}
                aria-hidden="true"
              />
              <span
                className="live-pin-ping absolute inset-0 rounded-full"
                style={{
                  backgroundColor: color.ping,
                  animationDelay: `${pulseDelay + 0.65}s`,
                }}
                aria-hidden="true"
              />
            </>
          ) : null}
          <span
            className={`relative z-10 h-3 w-3 rounded-full ring-2 ring-white ${isFuture ? "" : "live-pin-heartbeat"}`}
            style={{
              backgroundColor: color.hex,
              animationDelay: `${pulseDelay * 0.2}s`,
            }}
            aria-hidden="true"
          />
        </div>
      </MarkerContent>
      <MarkerTooltip>
        <span className="font-semibold">
          {match.homeTeam}
          {isFuture ? " vs " : ` ${match.homeGoals}–${match.awayGoals} `}
          {match.awayTeam}
        </span>
        <br />
        <span className="text-neutral-500">{match.league}</span>
        {isFuture ? (
          <>
            <br />
            <span className="text-neutral-400">{kickoffShort(match.kickoffAt)}</span>
          </>
        ) : null}
        {match.venue ? (
          <>
            <br />
            <span className="text-neutral-400">{match.venue}</span>
          </>
        ) : null}
      </MarkerTooltip>
    </MapMarker>
  );
}
