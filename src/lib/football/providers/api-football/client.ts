import { apiRequest } from "@/lib/http/api-client";
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
      const { data } = await apiRequest<ApiFootballLiveResponse>({
        scope: "server",
        provider: "api-football",
        method: "GET",
        url: `${API_BASE}/fixtures`,
        query: { live: "all" },
        headers: {
          "x-apisports-key": apiKey,
        },
        next: { revalidate: 60 },
      });

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
