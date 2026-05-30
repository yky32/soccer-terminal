const FLAG_BASE = "https://media.api-sports.io/flags";

const NATIONALITY_FLAG_SLUG: Record<string, string> = {
  Spain: "es",
  England: "gb-eng",
  Brazil: "br",
  France: "fr",
  Germany: "de",
  Argentina: "ar",
  Portugal: "pt",
  Netherlands: "nl",
  Italy: "it",
  Belgium: "be",
  Norway: "no",
  Japan: "jp",
  "South Korea": "kr",
  USA: "us",
  Mexico: "mx",
  International: "eu",
};

export function nationalityFlagUrl(nationality: string): string | null {
  const slug = NATIONALITY_FLAG_SLUG[nationality];
  return slug ? `${FLAG_BASE}/${slug}.svg` : null;
}
