import { buildAssistantBriefing } from "@/lib/assistant/build-briefing";
import { generateAssistantReply } from "@/lib/assistant/generate-assistant";
import { isLlmEnabled } from "@/lib/assistant/llm";
import { ENABLE_AI } from "@/lib/feature-flags";
import { withApiRouteHandler } from "@/lib/http/route-handler";

export const dynamic = "force-dynamic";

type ChatRequestBody = {
  question?: string;
  promptId?: string;
  history?: Array<{ role?: string; content?: string }>;
  watchlistIds?: unknown;
};

function parseHistory(raw: ChatRequestBody["history"]) {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(
      (message): message is { role: "user" | "assistant"; content: string } =>
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0,
    )
    .slice(-8);
}

function parseWatchlistIds(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is number => typeof id === "number").slice(0, 16);
}

export async function POST(request: Request) {
  type ChatSuccess = {
    reply: string;
    mode: "llm" | "demo";
    llmConfigured: boolean;
  };
  type ChatRouteBody = { error: string } | ChatSuccess;

  return withApiRouteHandler<ChatRouteBody>(
    { route: "/api/assistant/chat", method: "POST", request },
    async () => {
      if (!ENABLE_AI) {
        return { status: 404, body: { error: "Not found" } };
      }

      const body = (await request.json()) as ChatRequestBody;
      const question = body.question?.trim() ?? "";
      const promptId = body.promptId?.trim() || undefined;

      if (!question && !promptId) {
        throw new Error("question or promptId is required");
      }

      const context = await buildAssistantBriefing();
      const result = await generateAssistantReply({
        question,
        promptId,
        history: parseHistory(body.history),
        context,
        watchlistIds: parseWatchlistIds(body.watchlistIds),
      });

      return {
        body: {
          reply: result.reply,
          mode: result.mode,
          llmConfigured: isLlmEnabled(),
        },
      };
    },
  );
}
