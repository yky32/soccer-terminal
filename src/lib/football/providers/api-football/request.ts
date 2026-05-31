import { apiRequest } from "@/lib/http/api-client";
import {
  assertNoApiErrors,
  type ApiFootballEnvelope,
} from "@/lib/football/providers/api-football/errors";

const API_BASE = "https://v3.football.api-sports.io";

export async function apiFootballGet<T>(
  apiKey: string,
  path: string,
  query: Record<string, string | number>,
  revalidate = 300,
): Promise<T[]> {
  const { data } = await apiRequest<ApiFootballEnvelope<T>>({
    scope: "server",
    provider: "api-football",
    method: "GET",
    url: `${API_BASE}${path}`,
    query,
    headers: {
      "x-apisports-key": apiKey,
    },
    next: { revalidate },
  });

  assertNoApiErrors(data);
  return (data.response ?? []) as T[];
}

/** Same as apiFootballGet but returns an empty array instead of throwing. */
export async function apiFootballGetSafe<T>(
  apiKey: string,
  path: string,
  query: Record<string, string | number>,
  revalidate = 300,
): Promise<T[]> {
  try {
    return await apiFootballGet<T>(apiKey, path, query, revalidate);
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
