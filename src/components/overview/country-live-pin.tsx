"use client";

import { MapMarker, MarkerContent, MarkerTooltip } from "@/components/ui/map";
import {
  bubbleDiameter,
  type CountryMatchActivity,
} from "@/lib/data/live-match-countries";
import type { MapMatchMode } from "@/lib/data/map-match-mode";
import { cn } from "@/lib/utils";

type CountryLivePinProps = {
  country: CountryMatchActivity;
  maxMatches: number;
  mode?: MapMatchMode;
  /** Stagger ripples so pins do not pulse in sync */
  pulseDelay?: number;
};

const COUNTRY_PIN_SCALE = 1.3;

export function CountryLivePin({
  country,
  maxMatches,
  mode = "live",
  pulseDelay = 0,
}: CountryLivePinProps) {
  const size = Math.round(
    bubbleDiameter(country.liveMatches, maxMatches) * COUNTRY_PIN_SCALE,
  );
  const isFuture = mode === "future";

  return (
    <MapMarker longitude={country.longitude} latitude={country.latitude}>
      <MarkerContent>
        <div
          className="relative flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          {isFuture ? (
            <span
              className="absolute inset-0 rounded-full bg-sky-400/20"
              aria-hidden="true"
            />
          ) : (
            <>
              <span
                className="live-pin-ping absolute inset-0 rounded-full bg-emerald-500/35"
                style={{ animationDelay: `${pulseDelay}s` }}
                aria-hidden="true"
              />
              <span
                className="live-pin-ping absolute inset-0 rounded-full bg-emerald-500/25"
                style={{ animationDelay: `${pulseDelay + 0.65}s` }}
                aria-hidden="true"
              />
              <span
                className="live-pin-ping absolute inset-0 rounded-full bg-emerald-400/20"
                style={{ animationDelay: `${pulseDelay + 1.3}s` }}
                aria-hidden="true"
              />
            </>
          )}
          <div
            className={cn(
              "relative z-10 h-3.5 w-3.5 rounded-full",
              isFuture ? "bg-sky-600" : "live-pin-heartbeat bg-emerald-600",
            )}
            style={{ animationDelay: `${pulseDelay * 0.2}s` }}
            aria-hidden="true"
          />
        </div>
      </MarkerContent>
      <MarkerTooltip>
        {country.name}: {country.liveMatches}{" "}
        {isFuture ? "upcoming" : "live"}{" "}
        {country.liveMatches === 1 ? "match" : "matches"}
      </MarkerTooltip>
    </MapMarker>
  );
}
