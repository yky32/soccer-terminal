import type {
  ApiRequestDto,
  ApiResponseDto,
  ApiRouteRequestDto,
  ApiRouteResponseDto,
} from "@/lib/http/types";

function loggingEnabled() {
  if (process.env.API_HTTP_LOG === "false") return false;
  return true;
}

export function logApiRequest(dto: ApiRequestDto) {
  if (!loggingEnabled()) return;
  console.info("[API][Request DTO] 🔴🔴➡️➡️", JSON.stringify(dto, null, 2));
}

export function logApiResponse<T>(dto: ApiResponseDto<T>) {
  if (!loggingEnabled()) return;
  console.info("[API][Response DTO]  🟢🟢️⬅️⬅️", JSON.stringify(dto, null, 2));
}

export function logRouteRequest(dto: ApiRouteRequestDto) {
  if (!loggingEnabled()) return;
  console.info("[API][Route Request DTO] 🔴🔴➡️➡️", JSON.stringify(dto, null, 2));
}

export function logRouteResponse<T>(dto: ApiRouteResponseDto<T>) {
  if (!loggingEnabled()) return;
  console.info("[API][Route Response DTO] 🟢🟢️⬅️⬅️", JSON.stringify(dto, null, 2));
}

export function createRequestId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
