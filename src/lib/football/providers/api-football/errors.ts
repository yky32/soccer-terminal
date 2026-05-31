export type ApiFootballEnvelope<T> = {
  errors: Record<string, string> | unknown[];
  response: T;
};

export class RateLimitError extends Error {
  readonly name = "RateLimitError";

  constructor(message: string) {
    super(message);
  }
}

export function isRateLimitError(error: unknown) {
  if (error instanceof RateLimitError) return true;
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes("too many requests") || message.includes("rate limit");
}

export function assertNoApiErrors(data: ApiFootballEnvelope<unknown>) {
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    throw new Error("API-Football returned errors");
  }

  if (
    data.errors &&
    typeof data.errors === "object" &&
    !Array.isArray(data.errors) &&
    Object.keys(data.errors).length > 0
  ) {
    const message = Object.values(data.errors).join("; ");
    if (isRateLimitError(new Error(message))) {
      throw new RateLimitError(message);
    }
    throw new Error(message || "API-Football returned errors");
  }
}
