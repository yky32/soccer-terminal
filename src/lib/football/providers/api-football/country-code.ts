/** API-Football flag URLs use slugs like `eng`, `gb`, `cn`, `world` */
const FLAG_SLUG_TO_ISO: Record<string, string> = {
  eng: "GB",
  sco: "GB",
  wal: "GB",
  nir: "GB",
  gb: "GB",
  us: "US",
  world: "WORLD",
};

export function countryCodeFromLeagueFlag(flagUrl: string | null | undefined): string | null {
  if (!flagUrl) return null;

  const match = flagUrl.match(/\/flags\/([a-z0-9-]+)\.svg$/i);
  if (!match) return null;

  const slug = match[1].toLowerCase();
  if (FLAG_SLUG_TO_ISO[slug]) return FLAG_SLUG_TO_ISO[slug];
  if (slug.length === 2) return slug.toUpperCase();

  return null;
}

/** Fallback when the league flag slug is not a 2-letter code (e.g. FIFA World Cup). */
export function countryCodeFromLeagueCountry(country: string | null | undefined): string | null {
  if (!country) return null;

  const normalized = country.trim().toLowerCase();
  if (normalized === "world") return "WORLD";

  return null;
}
