import { getLiveMatchStats } from "@/lib/data/live-match-countries";
import { isMapMatchMode } from "@/lib/data/map-match-mode";
import { getFootballDataProvider } from "@/lib/football/get-provider";
import { withApiRouteHandler } from "@/lib/http/route-handler";

export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const modeParam = searchParams.get("mode");
  const mode = isMapMatchMode(modeParam) ? modeParam : "live";

  return withApiRouteHandler(
    { route: "/api/map/live-countries", method: "GET", request },
    async () => {
      const provider = getFootballDataProvider();
      const snapshot = await provider.getMapCountries(mode);
      const stats = getLiveMatchStats(snapshot.countries);

      return {
        body: {
          mode: snapshot.mode,
          ...stats,
          countries: snapshot.countries,
          matchesByCountry: snapshot.matchesByCountry,
          updatedAt: snapshot.updatedAt,
          provider: snapshot.provider,
        },
      };
    },
  );
}
