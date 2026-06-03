"use client";

import { ArrowUp, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatBriefingTime } from "@/lib/assistant/format-briefing-time";
import { getDemoPrompts } from "@/lib/assistant/demo-responses";
import { ENABLE_NEWS } from "@/lib/feature-flags";
import type { AssistantBriefing } from "@/lib/assistant/generate-assistant";
import { readWatchlistIds } from "@/lib/match-monitor";
import { glassFocus, glassInset, glassStrong } from "@/components/glass-surface";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type AssistantDemoProps = {
  briefing: AssistantBriefing;
  llmConfigured: boolean;
};

type ChatResponse = {
  reply: string;
  mode: "llm" | "demo";
  llmConfigured?: boolean;
};

const SIGNAL_STYLES = {
  live: "bg-emerald-500",
  news: "bg-sky-500",
  table: "bg-violet-500",
  upcoming: "bg-amber-500",
  neutral: "bg-neutral-400",
} as const;

function BriefingBulletRow({ bullet }: { bullet: AssistantBriefing["bullets"][number] }) {
  const content = (
    <>
      <span
        className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", SIGNAL_STYLES[bullet.signal])}
        aria-hidden
      />
      <span className="min-w-0 flex-1 text-[0.9375rem] leading-snug text-neutral-800">{bullet.text}</span>
    </>
  );

  if (bullet.href) {
    return (
      <Link
        href={bullet.href}
        className="flex gap-3 rounded-xl px-1 py-1.5 transition-colors hover:bg-white/50"
      >
        {content}
      </Link>
    );
  }

  return <div className="flex gap-3 px-1 py-1.5">{content}</div>;
}

function welcomeMessage(llmConfigured: boolean, mode: AssistantBriefing["mode"]) {
  const contextHint = ENABLE_NEWS ? "live map, news, and standings" : "live map and standings";

  if (mode === "llm") {
    return `Briefing and chat are powered by AI using ${contextHint} context. Ask anything or tap a quick prompt.`;
  }

  if (llmConfigured) {
    return "LLM is configured but this session is using grounded demo answers. Refresh the briefing or retry chat in a moment.";
  }

  return `Grounded demo mode — answers use ${contextHint} data. Set OPENAI_API_KEY in .env.local for AI summaries and chat.`;
}

export function AssistantDemo({ briefing: initialBriefing, llmConfigured }: AssistantDemoProps) {
  const demoPrompts = useMemo(() => getDemoPrompts(), []);
  const [briefing, setBriefing] = useState(initialBriefing);
  const [mode, setMode] = useState(initialBriefing.mode);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: welcomeMessage(llmConfigured, initialBriefing.mode),
    },
  ]);
  const [input, setInput] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const chatHistory = useMemo(
    () =>
      messages
        .filter((message) => message.id !== "welcome")
        .map((message) => ({ role: message.role, content: message.text })),
    [messages],
  );

  const askAssistant = useCallback(
    async (options: { question: string; promptId?: string; userLabel?: string }) => {
      const userText = options.userLabel ?? options.question.trim();
      if (!userText && !options.promptId) return;

      if (userText) {
        setMessages((current) => [
          ...current,
          { id: `user-${Date.now()}`, role: "user", text: userText },
        ]);
      }

      setThinking(true);

      try {
        const response = await fetch("/api/assistant/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: options.question.trim(),
            promptId: options.promptId,
            history: chatHistory,
            watchlistIds: readWatchlistIds(),
          }),
        });

        if (!response.ok) throw new Error("chat failed");

        const data = (await response.json()) as ChatResponse;
        setMode(data.mode);
        setMessages((current) => [
          ...current,
          { id: `assistant-${Date.now()}`, role: "assistant", text: data.reply },
        ]);
      } catch {
        setMessages((current) => [
          ...current,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            text: "Something went wrong reaching the assistant. Try again in a moment.",
          },
        ]);
      } finally {
        setThinking(false);
      }
    },
    [chatHistory],
  );

  const runPrompt = useCallback(
    (promptId: string, label: string) => {
      void askAssistant({ question: label, promptId, userLabel: label });
    },
    [askAssistant],
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const question = input.trim();
      if (!question || thinking) return;

      setInput("");
      void askAssistant({ question, userLabel: question });
    },
    [askAssistant, input, thinking],
  );

  const refreshBriefing = useCallback(async () => {
    setRefreshing(true);
    try {
      const watchlistIds = readWatchlistIds();
      const query =
        watchlistIds.length > 0 ? `?watchlist=${watchlistIds.join(",")}` : "";
      const response = await fetch(`/api/assistant/briefing${query}`, { cache: "no-store" });
      if (!response.ok) throw new Error("refresh failed");

      const next = (await response.json()) as AssistantBriefing & { llmConfigured?: boolean };
      setBriefing(next);
      setMode(next.mode);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <section className="page-container space-y-6 pb-16 sm:space-y-8 sm:pb-24">
      <div className={cn(glassStrong, "overflow-hidden p-6 sm:p-8")}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900/6 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-600">
                <Sparkles className="h-3 w-3" aria-hidden />
                {mode === "llm" ? "AI briefing" : "Grounded briefing"}
              </span>
              <span className="text-[0.6875rem] font-medium text-neutral-500">
                {formatBriefingTime(briefing.generatedAt)} · {briefing.provider}
              </span>
            </div>
            <h2 className="text-heading mt-4 font-semibold text-neutral-950">{briefing.headline}</h2>
            {briefing.aiSummary ? (
              <p className="text-body mt-4 max-w-3xl text-neutral-700">{briefing.aiSummary}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => void refreshBriefing()}
            disabled={refreshing}
            className={cn(
              glassInset,
              glassFocus,
              "inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.8125rem] font-medium text-neutral-700 transition-colors hover:text-neutral-950 disabled:opacity-50",
            )}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} aria-hidden />
            Refresh
          </button>
        </div>

        <ul className="mt-6 space-y-1 sm:mt-8">
          {briefing.bullets.map((bullet) => (
            <li key={bullet.id}>
              <BriefingBulletRow bullet={bullet} />
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        {demoPrompts.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            onClick={() => runPrompt(prompt.id, prompt.label)}
            disabled={thinking}
            className={cn(
              glassInset,
              glassFocus,
              "rounded-full px-3 py-1.5 text-[0.8125rem] font-medium text-neutral-700 transition-colors hover:bg-white/80 hover:text-neutral-950 disabled:opacity-50",
            )}
          >
            {prompt.label}
          </button>
        ))}
      </div>

      <div className={cn(glassStrong, "flex min-h-[22rem] flex-col overflow-hidden")}>
        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-[92%] whitespace-pre-line text-[0.9375rem] leading-relaxed",
                message.role === "user"
                  ? "ml-auto rounded-2xl rounded-br-md bg-neutral-900 px-4 py-3 text-white"
                  : "mr-auto rounded-2xl rounded-bl-md bg-white/70 px-4 py-3 text-neutral-800 ring-1 ring-black/[0.05]",
              )}
            >
              {message.text}
            </div>
          ))}
          {thinking ? (
            <div className="mr-auto rounded-2xl rounded-bl-md bg-white/70 px-4 py-3 text-[0.9375rem] text-neutral-500 ring-1 ring-black/[0.05]">
              Thinking…
            </div>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-black/[0.06] bg-white/35 p-4 sm:p-5"
        >
          <div className={cn(glassInset, "flex items-center gap-2 rounded-2xl p-2 pl-4")}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask anything about live football…"
              disabled={thinking}
              className="min-w-0 flex-1 bg-transparent text-[0.9375rem] text-neutral-900 outline-none placeholder:text-neutral-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className={cn(
                glassFocus,
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white transition-opacity disabled:opacity-35",
              )}
              aria-label="Send message"
            >
              <ArrowUp className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
