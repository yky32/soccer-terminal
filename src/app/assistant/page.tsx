import { buildAssistantBriefing } from "@/lib/assistant/build-briefing";
import { enrichAssistantBriefing } from "@/lib/assistant/generate-assistant";
import { isLlmEnabled } from "@/lib/assistant/llm";
import { AssistantDemo } from "@/components/assistant/assistant-demo";
import { PageHeader } from "@/components/page-header";
import { ENABLE_AI, ENABLE_NEWS } from "@/lib/feature-flags";
import { buildPageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";

export const metadata = buildPageMetadata({
  title: "AI Assistant",
  description: "Football briefings and conversational insights powered by live data.",
  path: "/assistant",
});

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  if (!ENABLE_AI) {
    notFound();
  }

  const briefing = await enrichAssistantBriefing(await buildAssistantBriefing());

  return (
    <>
      <PageHeader
        compact
        onGlass
        title="Your briefing."
        description={
          briefing.mode === "llm"
            ? ENABLE_NEWS
              ? "Live map context, news pulse, and league snapshots — summarized by AI from your terminal data."
              : "Live map context and league snapshots — summarized by AI from your terminal data."
            : ENABLE_NEWS
              ? "Live map context, news pulse, and league snapshots — grounded in your terminal data. Add OPENAI_API_KEY for AI summaries."
              : "Live map context and league snapshots — grounded in your terminal data. Add OPENAI_API_KEY for AI summaries."
        }
      />
      <AssistantDemo briefing={briefing} llmConfigured={isLlmEnabled()} />
    </>
  );
}
