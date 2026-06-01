import type { AssistantContext } from "@/lib/assistant/build-briefing";
import {
  buildBriefingEnhancementPrompt,
  buildChatMessages,
  buildContextPayload,
  resolveWatchlistMatches,
} from "@/lib/assistant/context-payload";
import { answerDemoPrompt, answerDemoQuestion, promptLabelForId } from "@/lib/assistant/demo-responses";
import { completeChat, extractJsonObject, isLlmEnabled } from "@/lib/assistant/llm";
import { ENABLE_NEWS } from "@/lib/feature-flags";

export type AssistantMode = "llm" | "demo";

export type AssistantBriefing = AssistantContext & {
  mode: AssistantMode;
  aiSummary: string | null;
};

type BriefingEnhancement = {
  headline?: string;
  summary?: string;
};

export async function enrichAssistantBriefing(
  context: AssistantContext,
  watchlistIds: number[] = [],
): Promise<AssistantBriefing> {
  if (!isLlmEnabled()) {
    return { ...context, mode: "demo", aiSummary: null };
  }

  try {
    const watchlistMatches = await resolveWatchlistMatches(watchlistIds);
    const payload = buildContextPayload(context, watchlistMatches);
    const raw = await completeChat(buildBriefingEnhancementPrompt(payload), 180);
    const parsed = extractJsonObject<BriefingEnhancement>(raw);

    return {
      ...context,
      mode: "llm",
      headline: parsed?.headline?.trim() || context.headline,
      aiSummary: parsed?.summary?.trim() || null,
    };
  } catch (error) {
    console.warn("[assistant] LLM briefing enhancement failed:", error);
    return { ...context, mode: "demo", aiSummary: null };
  }
}

export async function generateAssistantReply(input: {
  question: string;
  promptId?: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  context: AssistantContext;
  watchlistIds?: number[];
}): Promise<{ reply: string; mode: AssistantMode }> {
  const watchlistMatches = await resolveWatchlistMatches(input.watchlistIds ?? []);

  if (!isLlmEnabled()) {
    const reply = input.promptId
      ? answerDemoPrompt(input.promptId, input.context, watchlistMatches)
      : answerDemoQuestion(input.question, input.context, watchlistMatches);
    return { reply, mode: "demo" };
  }

  const question =
    input.question.trim() ||
    (input.promptId ? promptLabelForId(input.promptId) : "");

  if (!question) {
    return {
      reply: ENABLE_NEWS
        ? "Ask about live matches, your watchlist, news, or the table."
        : "Ask about live matches, your watchlist, or the table.",
      mode: "demo",
    };
  }

  try {
    const payload = buildContextPayload(input.context, watchlistMatches);
    const history = [...input.history, { role: "user" as const, content: question }];

    const reply = await completeChat(buildChatMessages(payload, history), 320);
    return { reply, mode: "llm" };
  } catch (error) {
    console.warn("[assistant] LLM chat failed, using demo fallback:", error);
    const reply = input.promptId
      ? answerDemoPrompt(input.promptId, input.context, watchlistMatches)
      : answerDemoQuestion(input.question, input.context, watchlistMatches);
    return { reply, mode: "demo" };
  }
}
