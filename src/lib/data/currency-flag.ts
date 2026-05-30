export const EUR_FLAG_URL = "https://media.api-sports.io/flags/eu.svg";

export function formatMarketValueEur(eur: number): string {
  if (eur >= 1_000_000) return `€${(eur / 1_000_000).toFixed(0)}M`;
  return `€${(eur / 1_000).toFixed(0)}K`;
}
