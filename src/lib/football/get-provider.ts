import type { FootballDataProvider } from "@/lib/football/provider";
import { createApiFootballProvider } from "@/lib/football/providers/api-football/client";
import { createMockProvider } from "@/lib/football/providers/mock/client";

export function getFootballDataProvider(): FootballDataProvider {
  const providerId = process.env.FOOTBALL_DATA_PROVIDER ?? "mock";

  if (providerId === "mock") {
    return createMockProvider();
  }

  if (providerId === "api-football") {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) {
      console.warn(
        "[football] API_FOOTBALL_KEY missing — falling back to mock provider",
      );
      return createMockProvider();
    }
    return createApiFootballProvider(apiKey);
  }

  throw new Error(`Unknown FOOTBALL_DATA_PROVIDER: ${providerId}`);
}
