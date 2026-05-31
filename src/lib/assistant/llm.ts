export type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenAiChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

export type LlmConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

export function getLlmConfig(): LlmConfig | null {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  return {
    apiKey,
    baseUrl: (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, ""),
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  };
}

export function isLlmEnabled() {
  return getLlmConfig() !== null;
}

export function extractJsonObject<T>(text: string): T | null {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;

  try {
    return JSON.parse(candidate) as T;
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;

    try {
      return JSON.parse(candidate.slice(start, end + 1)) as T;
    } catch {
      return null;
    }
  }
}

export async function completeChat(messages: LlmMessage[], maxTokens = 320): Promise<string> {
  const config = getLlmConfig();
  if (!config) {
    throw new Error("LLM is not configured");
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.35,
      max_tokens: maxTokens,
    }),
  });

  const payload = (await response.json()) as OpenAiChatResponse | { error?: { message?: string } };

  if (!response.ok) {
    const errorPayload = payload as { error?: { message?: string } };
    const message = errorPayload.error?.message ?? `LLM request failed (${response.status})`;
    throw new Error(message);
  }

  const content = (payload as OpenAiChatResponse).choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("LLM returned an empty response");
  }

  return content;
}
