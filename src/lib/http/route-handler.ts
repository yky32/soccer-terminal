import { NextResponse } from "next/server";
import {
  createRequestId,
  logRouteRequest,
  logRouteResponse,
} from "@/lib/http/logger";
import { sanitizeBody } from "@/lib/http/sanitize";
import type { ApiRouteRequestDto, ApiRouteResponseDto } from "@/lib/http/types";

type RouteHandlerOptions = {
  route: string;
  method: string;
  request?: Request;
};

type RouteHandlerResult<T> = {
  status?: number;
  body: T;
};

export async function withApiRouteHandler<T>(
  options: RouteHandlerOptions,
  handler: () => Promise<RouteHandlerResult<T>>,
) {
  const requestId = createRequestId("route");
  const startedAt = Date.now();

  let requestBody: unknown;

  if (options.request && options.method !== "GET" && options.method !== "HEAD") {
    try {
      requestBody = sanitizeBody(await options.request.json());
    } catch {
      requestBody = undefined;
    }
  }

  const query = options.request
    ? Object.fromEntries(new URL(options.request.url).searchParams.entries())
    : undefined;

  const requestDto: ApiRouteRequestDto = {
    id: requestId,
    route: options.route,
    method: options.method,
    query: query && Object.keys(query).length > 0 ? query : undefined,
    body: requestBody,
  };

  logRouteRequest(requestDto);

  try {
    const result = await handler();
    const status = result.status ?? 200;

    const responseDto: ApiRouteResponseDto<T> = {
      id: requestId,
      route: options.route,
      method: options.method,
      status,
      durationMs: Date.now() - startedAt,
      body: sanitizeBody(result.body),
    };

    logRouteResponse(responseDto);

    return NextResponse.json(result.body, { status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = 500;

    const responseDto: ApiRouteResponseDto<{ error: string }> = {
      id: requestId,
      route: options.route,
      method: options.method,
      status,
      durationMs: Date.now() - startedAt,
      body: { error: message },
    };

    logRouteResponse(responseDto);

    return NextResponse.json(responseDto.body, { status });
  }
}
