const SENSITIVE_HEADERS = new Set([
  "x-apisports-key",
  "authorization",
  "cookie",
  "set-cookie",
]);

const SENSITIVE_KEYS = /(api[_-]?key|token|secret|password|authorization)/i;

export function sanitizeHeaders(
  headers?: HeadersInit,
): Record<string, string> | undefined {
  if (!headers) return undefined;

  const record: Record<string, string> = {};

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      record[key] = redactHeader(key, value);
    });
    return record;
  }

  if (Array.isArray(headers)) {
    for (const [key, value] of headers) {
      record[key] = redactHeader(key, value);
    }
    return record;
  }

  for (const [key, value] of Object.entries(headers)) {
    record[key] = redactHeader(key, String(value));
  }

  return record;
}

export function sanitizeBody<T>(body: T): T {
  if (body === null || body === undefined) return body;
  if (typeof body !== "object") return body;

  if (Array.isArray(body)) {
    return body.map((item) => sanitizeBody(item)) as T;
  }

  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    output[key] = SENSITIVE_KEYS.test(key) ? "***" : sanitizeBody(value);
  }

  return output as T;
}

function redactHeader(key: string, value: string) {
  return SENSITIVE_HEADERS.has(key.toLowerCase()) ? "***" : value;
}
