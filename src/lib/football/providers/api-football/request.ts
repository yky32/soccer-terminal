import { apiRequest } from "@/lib/http/api-client";
import {
  assertNoApiErrors,
  type ApiFootballEnvelope,
} from "@/lib/football/providers/api-football/errors";
import { enqueueApiFootballRequest } from "@/lib/football/providers/api-football/request-queue";

const API_BASE = "https://v3.football.api-sports.io";

export type ApiFootballGetOptions = {
  revalidate?: number;
  /** Skip Next.js data cache (use for large responses that exceed the 2MB limit). */
  cache?: RequestCache;
};

function resolveGetOptions(options: number | ApiFootballGetOptions = 300): ApiFootballGetOptions {
  return typeof options === "number" ? { revalidate: options } : options;
}

export async function apiFootballGet<T>(
  apiKey: string,
  path: string,
  query: Record<string, string | number>,
  options: number | ApiFootballGetOptions = 300,
): Promise<T[]> {
  const { revalidate = 300, cache } = resolveGetOptions(options);

  return enqueueApiFootballRequest(async () => {
    const { data } = await apiRequest<ApiFootballEnvelope<T>>({
      scope: "server",
      provider: "api-football",
      method: "GET",
      url: `${API_BASE}${path}`,
      query,
      headers: {
        "x-apisports-key": apiKey,
      },
      ...(cache === "no-store" ? { cache: "no-store" as const } : { next: { revalidate } }),
    });

    assertNoApiErrors(data);
    return (data.response ?? []) as T[];
  });
}

/** Low-level fetch returning the full API envelope (for endpoints used outside apiFootballGet). */
export async function apiFootballFetch<T>(
  apiKey: string,
  path: string,
  query: Record<string, string | number>,
  options: number | ApiFootballGetOptions = 300,
): Promise<ApiFootballEnvelope<T>> {
  const { revalidate = 300, cache } = resolveGetOptions(options);

  return enqueueApiFootballRequest(async () => {
    const { data } = await apiRequest<ApiFootballEnvelope<T>>({
      scope: "server",
      provider: "api-football",
      method: "GET",
      url: `${API_BASE}${path}`,
      query,
      headers: {
        "x-apisports-key": apiKey,
      },
      ...(cache === "no-store" ? { cache: "no-store" as const } : { next: { revalidate } }),
    });

    assertNoApiErrors(data);
    return data;
  });
}

/** Same as apiFootballGet but returns an empty array instead of throwing. */
export async function apiFootballGetSafe<T>(
  apiKey: string,
  path: string,
  query: Record<string, string | number>,
  options: number | ApiFootballGetOptions = 300,
): Promise<T[]> {
  try {
    return await apiFootballGet<T>(apiKey, path, query, options);
  } catch {
    return [];
  }
}

export async function mapInBatches<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];

  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize);
    results.push(...(await Promise.all(batch.map(fn))));
  }

  return results;
}
