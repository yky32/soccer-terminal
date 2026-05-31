import { buildAssistantBriefing } from "@/lib/assistant/build-briefing";
import { enrichAssistantBriefing } from "@/lib/assistant/generate-assistant";
import { isLlmEnabled } from "@/lib/assistant/llm";
import { withApiRouteHandler } from "@/lib/http/route-handler";

export const dynamic = "force-dynamic";

function parseWatchlistIds(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is number => typeof id === "number").slice(0, 16);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const watchlistParam = searchParams.get("watchlist");
  const watchlistIds = watchlistParam
    ? parseWatchlistIds(
        watchlistParam.split(",").map((value) => Number(value.trim())),
      )
    : [];

  return withApiRouteHandler(
    { route: "/api/assistant/briefing", method: "GET", request },
    async () => {
      const context = await buildAssistantBriefing();
      const briefing = await enrichAssistantBriefing(context, watchlistIds);

      return {
        body: {
          ...briefing,
          llmConfigured: isLlmEnabled(),
        },
      };
    },
  );
}

export async function POST(request: Request) {
  return withApiRouteHandler(
    { route: "/api/assistant/briefing", method: "POST", request },
    async () => {
      const body = (await request.json()) as { watchlistIds?: unknown };
      const context = await buildAssistantBriefing();
      const briefing = await enrichAssistantBriefing(
        context,
        parseWatchlistIds(body.watchlistIds),
      );

      return {
        body: {
          ...briefing,
          llmConfigured: isLlmEnabled(),
        },
      };
    },
  );
}
