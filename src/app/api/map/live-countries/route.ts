import { getLiveMatchStats } from "@/lib/data/live-match-countries";
import { getFootballDataProvider } from "@/lib/football/get-provider";
import { withApiRouteHandler } from "@/lib/http/route-handler";

export const revalidate = 60;

export async function GET(request: Request) {
  return withApiRouteHandler(
    { route: "/api/map/live-countries", method: "GET", request },
    async () => {
      const provider = getFootballDataProvider();
      const snapshot = await provider.getLiveCountries();
      const stats = getLiveMatchStats(snapshot.countries);

      return {
        body: {
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
