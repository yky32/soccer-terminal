import type { LeagueProfile } from "@/lib/data/league-profile";
import { getFootballDataProvider } from "@/lib/football/get-provider";
import { ROUTE_REVALIDATE_LEAGUE_SEC } from "@/lib/football/refresh-policy";
import { withApiRouteHandler } from "@/lib/http/route-handler";

/** Keep in sync with ROUTE_REVALIDATE_LEAGUE_SEC in refresh-policy.ts */
export const revalidate = 600;

type RouteContext = {
  params: Promise<{ leagueId: string }>;
};

type LeagueRouteBody = LeagueProfile | { error: string };

export async function GET(request: Request, context: RouteContext) {
  const { leagueId } = await context.params;

  return withApiRouteHandler<LeagueRouteBody>(
    {
      route: "/api/leagues/[leagueId]",
      method: "GET",
      request,
      cache: { sMaxAge: ROUTE_REVALIDATE_LEAGUE_SEC },
    },
    async () => {
      const league = await getFootballDataProvider().getLeagueById(leagueId);

      if (!league) {
        return { status: 404, body: { error: "League not found" } };
      }

      return { body: league };
    },
  );
}
