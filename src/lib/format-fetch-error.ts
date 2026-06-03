/** User-facing copy for client fetch failures (rate limits, network, etc.). */
export function formatFetchError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Data is temporarily limited. Try again in a minute.";
  }
  return message;
}
