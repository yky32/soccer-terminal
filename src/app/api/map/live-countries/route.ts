import { getLiveMatchStats } from "@/lib/data/live-match-countries";
import type { LiveCountriesBothResponse } from "@/lib/data/live-match-countries";
import type { MapMatchMode } from "@/lib/data/map-match-mode";
import { isMapMatchMode } from "@/lib/data/map-match-mode";
import { getFootballDataProvider } from "@/lib/football/get-provider";
import type { LiveCountriesSnapshot } from "@/lib/football/provider";
import { isRateLimitError } from "@/lib/football/providers/api-football/errors";
import { withApiRouteHandler } from "@/lib/http/route-handler";

/** Keep in sync with ROUTE_REVALIDATE_MAP_SEC in refresh-policy.ts */
export const revalidate = 600;

function snapshotToResponse(snapshot: LiveCountriesSnapshot) {
  const stats = getLiveMatchStats(snapshot.countries);

  return {
    mode: snapshot.mode,
    ...stats,
    countries: snapshot.countries,
    matchesByCountry: snapshot.matchesByCountry,
    updatedAt: snapshot.updatedAt,
    provider: snapshot.provider,
  };
}

function emptyResponse(mode: MapMatchMode) {
  const stats = getLiveMatchStats([]);

  return {
    mode,
    ...stats,
    countries: [],
    matchesByCountry: {},
    updatedAt: new Date().toISOString(),
    provider: "api-football",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const modeParam = searchParams.get("mode");

  if (modeParam === "both") {
    return withApiRouteHandler<LiveCountriesBothResponse>(
      { route: "/api/map/live-countries", method: "GET", request },
      async () => {
        const provider = getFootballDataProvider();

        try {
          const [liveSnapshot, futureSnapshot] = await Promise.all([
            provider.getMapCountries("live"),
            provider.getMapCountries("future"),
          ]);

          return {
            body: {
              live: snapshotToResponse(liveSnapshot),
              future: snapshotToResponse(futureSnapshot),
            } satisfies LiveCountriesBothResponse,
          };
        } catch (error) {
          if (!isRateLimitError(error)) throw error;

          return {
            body: {
              live: emptyResponse("live"),
              future: emptyResponse("future"),
              error: error instanceof Error ? error.message : "Rate limit exceeded",
            } satisfies LiveCountriesBothResponse,
          };
        }
      },
    );
  }

  const mode = isMapMatchMode(modeParam) ? modeParam : "live";

  return withApiRouteHandler(
    { route: "/api/map/live-countries", method: "GET", request },
    async () => {
      const provider = getFootballDataProvider();

      try {
        const snapshot = await provider.getMapCountries(mode);
        return { body: snapshotToResponse(snapshot) };
      } catch (error) {
        if (!isRateLimitError(error)) throw error;

        return {
          body: {
            ...emptyResponse(mode),
            error: error instanceof Error ? error.message : "Rate limit exceeded",
          },
        };
      }
    },
  );
}
