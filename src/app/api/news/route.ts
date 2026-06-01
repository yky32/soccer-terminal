import { getFootballDataProvider } from "@/lib/football/get-provider";
import { ENABLE_NEWS } from "@/lib/feature-flags";
import { withApiRouteHandler } from "@/lib/http/route-handler";
import type { NewsArticle } from "@/lib/data/news-article";

/** Keep in sync with ROUTE_REVALIDATE_NEWS_SEC in refresh-policy.ts */
export const revalidate = 1800;

export async function GET(request: Request) {
  type NewsRouteBody = { error: string } | { articles: NewsArticle[] };

  return withApiRouteHandler<NewsRouteBody>(
    { route: "/api/news", method: "GET", request },
    async () => {
      if (!ENABLE_NEWS) {
        return { status: 404, body: { error: "Not found" } };
      }

      const articles = await getFootballDataProvider().getNewsArticles();
      return { body: { articles } };
    },
  );
}
