import type { MapMatchMode } from "@/lib/data/map-match-mode";
import type { FootballDataProvider } from "@/lib/football/provider";
import { buildSnapshotFromMatches } from "@/lib/football/providers/mock/build-snapshot";
import {
  MOCK_FUTURE_MATCHES,
  MOCK_LIVE_MATCHES,
} from "@/lib/football/providers/mock/fixtures";

const MOCK_LATENCY_MS = 180;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createMockProvider(): FootballDataProvider {
  return {
    id: "mock",

    async getMapCountries(mode: MapMatchMode) {
      await delay(MOCK_LATENCY_MS);

      const matches = mode === "live" ? MOCK_LIVE_MATCHES : MOCK_FUTURE_MATCHES;
      return buildSnapshotFromMatches(matches, mode);
    },
  };
}
