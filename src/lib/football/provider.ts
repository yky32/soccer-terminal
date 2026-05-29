import type { LiveMatch } from "@/lib/data/live-match";
import type { CountryMatchActivity } from "@/lib/data/live-match-countries";
import type { MapMatchMode } from "@/lib/data/map-match-mode";

export type LiveCountriesSnapshot = {
  mode: MapMatchMode;
  countries: CountryMatchActivity[];
  matchesByCountry: Record<string, LiveMatch[]>;
  updatedAt: string;
  provider: string;
};

/** Swap implementations without changing UI or API routes */
export interface FootballDataProvider {
  readonly id: string;
  getMapCountries(mode: MapMatchMode): Promise<LiveCountriesSnapshot>;
}
