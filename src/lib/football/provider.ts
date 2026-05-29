import type { LiveMatch } from "@/lib/data/live-match";
import type { CountryMatchActivity } from "@/lib/data/live-match-countries";

export type LiveCountriesSnapshot = {
  countries: CountryMatchActivity[];
  matchesByCountry: Record<string, LiveMatch[]>;
  updatedAt: string;
  provider: string;
};

/** Swap implementations without changing UI or API routes */
export interface FootballDataProvider {
  readonly id: string;
  getLiveCountries(): Promise<LiveCountriesSnapshot>;
}
