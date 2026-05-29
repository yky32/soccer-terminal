import {
  createRequestId,
  logApiRequest,
  logApiResponse,
} from "@/lib/http/logger";
import { sanitizeBody, sanitizeHeaders } from "@/lib/http/sanitize";
import type { ApiRequestDto, ApiResponseDto } from "@/lib/http/types";

type QueryValue = string | number | boolean | undefined | null;

export type ApiRequestOptions<TBody = unknown> = {
  scope?: "server" | "client";
  provider?: string;
  method?: string;
  url: string;
  query?: Record<string, QueryValue>;
  headers?: HeadersInit;
  body?: TBody;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

function buildUrl(url: string, query?: Record<string, QueryValue>) {
  if (!query || Object.keys(query).length === 0) return url;

  const isAbsolute = url.startsWith("http://") || url.startsWith("https://");
  const target = isAbsolute ? new URL(url) : new URL(url, "http://localhost");

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    target.searchParams.set(key, String(value));
  }

  return isAbsolute
    ? target.toString()
    : `${target.pathname}${target.search}`;
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly responseBody: unknown;

  constructor(message: string, status: number, responseBody: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.responseBody = responseBody;
  }
}

export async function apiRequest<TResponse, TBody = unknown>(
  options: ApiRequestOptions<TBody>,
): Promise<{ data: TResponse; dto: ApiResponseDto<TResponse> }> {
  const scope = options.scope ?? "server";
  const method = (options.method ?? "GET").toUpperCase();
  const url = buildUrl(options.url, options.query);
  const requestId = createRequestId(options.provider ?? scope);
  const hasBody = options.body !== undefined && method !== "GET" && method !== "HEAD";

  const requestDto: ApiRequestDto = {
    id: requestId,
    scope,
    provider: options.provider,
    method,
    url,
    query: options.query
      ? Object.fromEntries(
          Object.entries(options.query)
            .filter(([, value]) => value !== undefined && value !== null)
            .map(([key, value]) => [key, String(value)]),
        )
      : undefined,
    headers: sanitizeHeaders(options.headers),
    body: hasBody ? sanitizeBody(options.body) : undefined,
  };

  logApiRequest(requestDto);

  const startedAt = Date.now();

  const response = await fetch(url, {
    method,
    headers: options.headers,
    body: hasBody ? JSON.stringify(options.body) : undefined,
    cache: options.cache,
    next: options.next,
  });

  const durationMs = Date.now() - startedAt;
  const rawText = await response.text();
  let parsedBody: unknown = rawText;

  if (rawText) {
    try {
      parsedBody = JSON.parse(rawText) as unknown;
    } catch {
      parsedBody = rawText;
    }
  } else {
    parsedBody = null;
  }

  const responseDto: ApiResponseDto<TResponse> = {
    id: requestId,
    scope,
    provider: options.provider,
    method,
    url,
    status: response.status,
    ok: response.ok,
    durationMs,
    body: sanitizeBody(parsedBody) as TResponse,
  };

  logApiResponse(responseDto);

  if (!response.ok) {
    throw new ApiRequestError(
      `API request failed (${response.status} ${response.statusText})`,
      response.status,
      parsedBody,
    );
  }

  return { data: parsedBody as TResponse, dto: responseDto };
}
