export type ApiRequestDto = {
  id: string;
  scope: "server" | "client";
  provider?: string;
  method: string;
  url: string;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  body?: unknown;
};

export type ApiResponseDto<T = unknown> = {
  id: string;
  scope: "server" | "client";
  provider?: string;
  method: string;
  url: string;
  status: number;
  ok: boolean;
  durationMs: number;
  body: T;
};

export type ApiRouteRequestDto = {
  id: string;
  route: string;
  method: string;
  query?: Record<string, string>;
  body?: unknown;
};

export type ApiRouteResponseDto<T = unknown> = {
  id: string;
  route: string;
  method: string;
  status: number;
  durationMs: number;
  body: T;
};
