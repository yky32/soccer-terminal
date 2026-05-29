import type { FootballDataProvider } from "@/lib/football/provider";
import { createApiFootballProvider } from "@/lib/football/providers/api-football/client";

export function getFootballDataProvider(): FootballDataProvider {
  const providerId = process.env.FOOTBALL_DATA_PROVIDER ?? "api-football";

  if (providerId === "api-football") {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) {
      throw new Error("API_FOOTBALL_KEY is not configured");
    }
    return createApiFootballProvider(apiKey);
  }

  throw new Error(`Unknown FOOTBALL_DATA_PROVIDER: ${providerId}`);
}
