import type {
  FootballDataProvider,
  LiveCountriesSnapshot,
} from "@/lib/football/provider";
import { aggregateLiveCountries } from "@/lib/football/providers/api-football/aggregate";
import type { ApiFootballLiveResponse } from "@/lib/football/providers/api-football/types";

const API_BASE = "https://v3.football.api-sports.io";

export function createApiFootballProvider(apiKey: string): FootballDataProvider {
  return {
    id: "api-football",

    async getLiveCountries(): Promise<LiveCountriesSnapshot> {
      const response = await fetch(`${API_BASE}/fixtures?live=all`, {
        headers: {
          "x-apisports-key": apiKey,
        },
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        throw new Error(
          `API-Football request failed (${response.status} ${response.statusText})`,
        );
      }

      const data = (await response.json()) as ApiFootballLiveResponse;

      if (Array.isArray(data.errors) && data.errors.length > 0) {
        throw new Error("API-Football returned errors for live fixtures");
      }

      if (
        data.errors &&
        typeof data.errors === "object" &&
        !Array.isArray(data.errors) &&
        Object.keys(data.errors).length > 0
      ) {
        const message = Object.values(data.errors).join("; ");
        throw new Error(message || "API-Football returned errors");
      }

      const countries = aggregateLiveCountries(data.response ?? []);

      return {
        countries,
        updatedAt: new Date().toISOString(),
        provider: "api-football",
      };
    },
  };
}
