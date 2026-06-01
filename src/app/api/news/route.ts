import { getFootballDataProvider } from "@/lib/football/get-provider";
import { withApiRouteHandler } from "@/lib/http/route-handler";

/** Keep in sync with ROUTE_REVALIDATE_NEWS_SEC in refresh-policy.ts */
export const revalidate = 600;

export async function GET(request: Request) {
  return withApiRouteHandler(
    { route: "/api/news", method: "GET", request },
    async () => {
      const articles = await getFootballDataProvider().getNewsArticles();
      return { body: { articles } };
    },
  );
}
