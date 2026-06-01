import { buildAssistantBriefing } from "@/lib/assistant/build-briefing";
import { enrichAssistantBriefing } from "@/lib/assistant/generate-assistant";
import { isLlmEnabled } from "@/lib/assistant/llm";
import { ENABLE_AI } from "@/lib/feature-flags";
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

  type BriefingSuccess = Awaited<ReturnType<typeof enrichAssistantBriefing>> & {
    llmConfigured: boolean;
  };
  type BriefingRouteBody = { error: string } | BriefingSuccess;

  return withApiRouteHandler<BriefingRouteBody>(
    { route: "/api/assistant/briefing", method: "GET", request },
    async () => {
      if (!ENABLE_AI) {
        return { status: 404, body: { error: "Not found" } };
      }

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
  type BriefingSuccess = Awaited<ReturnType<typeof enrichAssistantBriefing>> & {
    llmConfigured: boolean;
  };
  type BriefingRouteBody = { error: string } | BriefingSuccess;

  return withApiRouteHandler<BriefingRouteBody>(
    { route: "/api/assistant/briefing", method: "POST", request },
    async () => {
      if (!ENABLE_AI) {
        return { status: 404, body: { error: "Not found" } };
      }

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
