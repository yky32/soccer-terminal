"use client";

import { MapMarker, MarkerContent, MarkerTooltip } from "@/components/ui/map";
import type { LiveMatch } from "@/lib/data/live-match";
import { getMatchPinColor } from "@/lib/football/match-pin-colors";

type MatchVenuePinProps = {
  match: LiveMatch;
  colorIndex: number;
  pulseDelay?: number;
};

export function MatchVenuePin({
  match,
  colorIndex,
  pulseDelay = 0,
}: MatchVenuePinProps) {
  if (match.latitude === null || match.longitude === null) return null;

  const color = getMatchPinColor(colorIndex);

  return (
    <MapMarker longitude={match.longitude} latitude={match.latitude}>
      <MarkerContent>
        <div className="relative flex h-5 w-5 items-center justify-center">
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
          <span
            className="live-pin-heartbeat relative z-10 h-3 w-3 rounded-full ring-2 ring-white"
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
          {match.homeTeam} {match.homeGoals}–{match.awayGoals} {match.awayTeam}
        </span>
        <br />
        <span className="text-neutral-500">{match.league}</span>
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
