import { isRateLimitError } from "@/lib/football/providers/api-football/errors";

/** Minimum gap between API-Football requests (free tier ≈10/min; paid ≈100/min). */
const MIN_GAP_MS = 650;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 8_000;

let chain: Promise<void> = Promise.resolve();
let lastRequestAt = 0;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function enqueueApiFootballRequest<T>(fn: () => Promise<T>): Promise<T> {
  const run = async () => {
    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      const wait = Math.max(0, MIN_GAP_MS - (Date.now() - lastRequestAt));
      if (wait > 0) await sleep(wait);

      lastRequestAt = Date.now();

      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (!isRateLimitError(error) || attempt === MAX_RETRIES) throw error;
        await sleep(RETRY_DELAY_MS);
      }
    }

    throw lastError;
  };

  const result = chain.then(run, run);
  chain = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}
