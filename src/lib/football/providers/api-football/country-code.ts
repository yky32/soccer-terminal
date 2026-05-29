/** API-Football flag URLs use slugs like `eng`, `gb`, `cn` */
const FLAG_SLUG_TO_ISO: Record<string, string> = {
  eng: "GB",
  sco: "GB",
  wal: "GB",
  nir: "GB",
  gb: "GB",
  us: "US",
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
