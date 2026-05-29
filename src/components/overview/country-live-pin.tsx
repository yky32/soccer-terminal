"use client";

import { MapMarker, MarkerContent, MarkerTooltip } from "@/components/ui/map";
import {
  bubbleDiameter,
  type CountryMatchActivity,
} from "@/lib/data/live-match-countries";

type CountryLivePinProps = {
  country: CountryMatchActivity;
  maxMatches: number;
  /** Stagger ripples so pins do not pulse in sync */
  pulseDelay?: number;
};

const COUNTRY_PIN_SCALE = 1.3;

export function CountryLivePin({
  country,
  maxMatches,
  pulseDelay = 0,
}: CountryLivePinProps) {
  const size = Math.round(
    bubbleDiameter(country.liveMatches, maxMatches) * COUNTRY_PIN_SCALE,
  );

  return (
    <MapMarker longitude={country.longitude} latitude={country.latitude}>
      <MarkerContent>
        <div
          className="relative flex items-center justify-center"
          style={{ width: size, height: size }}
        >
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
          <div
            className="live-pin-heartbeat relative z-10 h-3.5 w-3.5 rounded-full bg-emerald-600"
            style={{ animationDelay: `${pulseDelay * 0.2}s` }}
            aria-hidden="true"
          />
        </div>
      </MarkerContent>
      <MarkerTooltip>
        {country.name}: {country.liveMatches} live{" "}
        {country.liveMatches === 1 ? "match" : "matches"}
      </MarkerTooltip>
    </MapMarker>
  );
}
