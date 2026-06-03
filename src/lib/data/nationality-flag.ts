const FLAG_BASE = "https://media.api-sports.io/flags";

/** Slugs verified against media.api-sports.io (HEAD 200). */
const VALID_FLAG_SLUGS = new Set([
  "ar",
  "au",
  "be",
  "br",
  "de",
  "es",
  "eu",
  "fr",
  "gb",
  "gb-eng",
  "gb-sct",
  "it",
  "jp",
  "kr",
  "mx",
  "nl",
  "no",
  "pt",
  "sa",
  "tr",
  "un",
  "us",
]);

const COUNTRY_ALIASES: Record<string, string> = {
  "united states": "USA",
  "united states of america": "USA",
  "u.s.a.": "USA",
  "u.s.a": "USA",
  "korea republic": "South Korea",
  "republic of korea": "South Korea",
  "saudi-arabia": "Saudi Arabia",
};

/** Canonical country / nationality labels → API-Football flag slug. */
const COUNTRY_FLAG_SLUG: Record<string, string> = {
  Argentina: "ar",
  Australia: "au",
  Belgium: "be",
  Brazil: "br",
  England: "gb-eng",
  Europe: "eu",
  France: "fr",
  Germany: "de",
  International: "eu",
  Italy: "it",
  Japan: "jp",
  Mexico: "mx",
  Netherlands: "nl",
  Norway: "no",
  Portugal: "pt",
  "Saudi Arabia": "sa",
  Scotland: "gb-sct",
  Spain: "es",
  Turkey: "tr",
  USA: "us",
  World: "un",
  "South Korea": "kr",
};

function normalizeCountryName(country: string) {
  const trimmed = country.trim();
  if (!trimmed) return trimmed;

  const alias = COUNTRY_ALIASES[trimmed.toLowerCase()];
  return alias ?? trimmed;
}

export function extractFlagSlug(flagUrl: string | null | undefined): string | null {
  if (!flagUrl) return null;

  const match = flagUrl.match(/\/flags\/([a-z0-9-]+)(?:\.[a-z]+)?(?:[?#]|$)/i);
  const slug = match?.[1]?.toLowerCase() ?? null;

  if (!slug || !VALID_FLAG_SLUGS.has(slug)) return null;
  return slug;
}

function slugForCountry(country: string): string | null {
  const normalized = normalizeCountryName(country);
  const slug = COUNTRY_FLAG_SLUG[normalized];
  return slug && VALID_FLAG_SLUGS.has(slug) ? slug : null;
}

export function countryFlagUrl(
  country: string,
  explicitUrl?: string | null,
): string | null {
  const slug = extractFlagSlug(explicitUrl) ?? slugForCountry(country);
  return slug ? `${FLAG_BASE}/${slug}.svg` : null;
}

export function nationalityFlagUrl(nationality: string): string | null {
  return countryFlagUrl(nationality);
}
