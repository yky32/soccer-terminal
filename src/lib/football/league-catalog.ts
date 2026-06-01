import type { LeagueProfile } from "@/lib/data/league-profile";
import type { LeagueRegion, LeagueTier } from "@/lib/data/league-profile";

export type LeagueSeasonKind = "split" | "calendar" | "tournament";

export type LeagueCatalogEntry = {
  id: string;
  apiId: number;
  name: string;
  shortName: string;
  country: string;
  countryFlag: string | null;
  logo: string | null;
  region: LeagueRegion;
  tier: LeagueTier;
  newsLabel: string;
  seasonKind: LeagueSeasonKind;
  /** Shows knockout tab + fetches knockout rounds from API-Football */
  hasKnockoutStage?: boolean;
};

export function competitionFormatForEntry(entry: LeagueCatalogEntry): LeagueProfile["competitionFormat"] {
  if (entry.seasonKind === "tournament") return "tournament";
  if (entry.hasKnockoutStage) return "knockout-cup";
  return "league";
}

export function entryHasKnockoutStage(entry: LeagueCatalogEntry) {
  return Boolean(entry.hasKnockoutStage ?? entry.seasonKind === "tournament");
}

const leagueLogo = (id: number) =>
  `https://media.api-sports.io/football/leagues/${id}.png`;

/** Fixture / API `league.name` values that map to a catalog entry. */
const CATALOG_LEAGUE_ALIASES: Partial<Record<string, readonly string[]>> = {
  "world-cup": ["World Cup", "FIFA World Cup"],
  ucl: ["Champions League", "UEFA Champions League"],
  uel: ["Europa League", "UEFA Europa League", "UEFA Europa Conference League"],
  mls: ["MLS"],
  "saudi-pro": ["Pro League"],
};

function entryMatchesLeagueName(entry: LeagueCatalogEntry, leagueName: string) {
  if (
    leagueName === entry.name ||
    leagueName === entry.newsLabel ||
    leagueName === entry.shortName
  ) {
    return true;
  }

  const aliases = CATALOG_LEAGUE_ALIASES[entry.id];
  return aliases?.includes(leagueName) ?? false;
}

export function getCatalogEntryByLeagueName(leagueName: string): LeagueCatalogEntry | null {
  const trimmed = leagueName.trim();
  if (!trimmed) return null;

  for (const entry of LEAGUE_CATALOG) {
    if (entryMatchesLeagueName(entry, trimmed)) return entry;
  }

  if (/world\s*cup/i.test(trimmed)) {
    return getCatalogEntryById("world-cup");
  }

  return null;
}

/** UI labels such as famous-league chips (`newsLabel`, `name`, or `shortName`). */
export function getCatalogEntryByDisplayName(displayName: string): LeagueCatalogEntry | null {
  const trimmed = displayName.trim();
  if (!trimmed) return null;

  return (
    LEAGUE_CATALOG.find(
      (entry) =>
        entry.name === trimmed ||
        entry.newsLabel === trimmed ||
        entry.shortName === trimmed,
    ) ?? getCatalogEntryByLeagueName(trimmed)
  );
}

export function getCatalogEntryForApiLeague(
  apiId: number,
  leagueName?: string | null,
): LeagueCatalogEntry | null {
  return getCatalogEntryByApiId(apiId) ?? (leagueName ? getCatalogEntryByLeagueName(leagueName) : null);
}

export function resolveLeagueLogo(
  apiId: number,
  leagueName: string | null | undefined,
  apiLogo: string | null | undefined,
): string | null {
  if (apiLogo) return apiLogo;
  return getCatalogEntryForApiLeague(apiId, leagueName)?.logo ?? null;
}

export function resolveLeagueFlag(
  apiId: number,
  leagueName: string | null | undefined,
  apiFlag: string | null | undefined,
): string | null {
  if (apiFlag) return apiFlag;
  return getCatalogEntryForApiLeague(apiId, leagueName)?.countryFlag ?? null;
}

export const LEAGUE_CATALOG: LeagueCatalogEntry[] = [
  {
    id: "premier-league",
    apiId: 39,
    name: "Premier League",
    shortName: "EPL",
    country: "England",
    countryFlag: "https://media.api-sports.io/flags/gb-eng.svg",
    logo: leagueLogo(39),
    region: "europe",
    tier: "top-flight",
    newsLabel: "Premier League",
    seasonKind: "split",
  },
  {
    id: "world-cup",
    apiId: 1,
    name: "FIFA World Cup",
    shortName: "WC",
    country: "World",
    countryFlag: "https://media.api-sports.io/flags/world.svg",
    logo: leagueLogo(1),
    region: "world",
    tier: "continental",
    newsLabel: "World Cup",
    seasonKind: "tournament",
    hasKnockoutStage: true,
  },
  {
    id: "ucl",
    apiId: 2,
    name: "UEFA Champions League",
    shortName: "UCL",
    country: "Europe",
    countryFlag: "https://media.api-sports.io/flags/eu.svg",
    logo: leagueLogo(2),
    region: "europe",
    tier: "continental",
    newsLabel: "Champions League",
    seasonKind: "split",
    hasKnockoutStage: true,
  },
  {
    id: "uel",
    apiId: 3,
    name: "UEFA Europa League",
    shortName: "UEL",
    country: "Europe",
    countryFlag: "https://media.api-sports.io/flags/eu.svg",
    logo: leagueLogo(3),
    region: "europe",
    tier: "continental",
    newsLabel: "Europa League",
    seasonKind: "split",
    hasKnockoutStage: true,
  },
  {
    id: "la-liga",
    apiId: 140,
    name: "La Liga",
    shortName: "La Liga",
    country: "Spain",
    countryFlag: "https://media.api-sports.io/flags/es.svg",
    logo: leagueLogo(140),
    region: "europe",
    tier: "top-flight",
    newsLabel: "La Liga",
    seasonKind: "split",
  },
  {
    id: "bundesliga",
    apiId: 78,
    name: "Bundesliga",
    shortName: "Bundesliga",
    country: "Germany",
    countryFlag: "https://media.api-sports.io/flags/de.svg",
    logo: leagueLogo(78),
    region: "europe",
    tier: "top-flight",
    newsLabel: "Bundesliga",
    seasonKind: "split",
  },
  {
    id: "serie-a",
    apiId: 135,
    name: "Serie A",
    shortName: "Serie A",
    country: "Italy",
    countryFlag: "https://media.api-sports.io/flags/it.svg",
    logo: leagueLogo(135),
    region: "europe",
    tier: "top-flight",
    newsLabel: "Serie A",
    seasonKind: "split",
  },
  {
    id: "ligue-1",
    apiId: 61,
    name: "Ligue 1",
    shortName: "Ligue 1",
    country: "France",
    countryFlag: "https://media.api-sports.io/flags/fr.svg",
    logo: leagueLogo(61),
    region: "europe",
    tier: "top-flight",
    newsLabel: "Ligue 1",
    seasonKind: "split",
  },
  {
    id: "mls",
    apiId: 253,
    name: "Major League Soccer",
    shortName: "MLS",
    country: "USA",
    countryFlag: "https://media.api-sports.io/flags/us.svg",
    logo: leagueLogo(253),
    region: "americas",
    tier: "top-flight",
    newsLabel: "MLS",
    seasonKind: "calendar",
  },
  {
    id: "saudi-pro",
    apiId: 307,
    name: "Saudi Pro League",
    shortName: "SPL",
    country: "Saudi Arabia",
    countryFlag: "https://media.api-sports.io/flags/sa.svg",
    logo: leagueLogo(307),
    region: "middle-east",
    tier: "top-flight",
    newsLabel: "Pro League",
    seasonKind: "split",
  },
  {
    id: "j1",
    apiId: 98,
    name: "J1 League",
    shortName: "J1",
    country: "Japan",
    countryFlag: "https://media.api-sports.io/flags/jp.svg",
    logo: leagueLogo(98),
    region: "asia",
    tier: "top-flight",
    newsLabel: "J1 League",
    seasonKind: "calendar",
  },
];

export function getCatalogEntryById(id: string) {
  return LEAGUE_CATALOG.find((entry) => entry.id === id) ?? null;
}

export function getCatalogEntryByApiId(apiId: number) {
  return LEAGUE_CATALOG.find((entry) => entry.apiId === apiId) ?? null;
}

export function seasonYearForEntry(entry: LeagueCatalogEntry, now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();

  if (entry.seasonKind === "calendar" || entry.seasonKind === "tournament") {
    return year;
  }

  return month >= 7 ? year : year - 1;
}

export function seasonLabelForEntry(entry: LeagueCatalogEntry, seasonYear: number) {
  if (entry.seasonKind === "calendar" || entry.seasonKind === "tournament") {
    return String(seasonYear);
  }

  const next = String(seasonYear + 1).slice(-2);
  return `${seasonYear}/${next}`;
}

/** Static league row for the picker rail — zero API calls. */
export function buildLeagueCatalogShell(entry: LeagueCatalogEntry): LeagueProfile {
  const seasonYear = seasonYearForEntry(entry);

  return {
    id: entry.id,
    name: entry.name,
    shortName: entry.shortName,
    country: entry.country,
    countryFlag: entry.countryFlag,
    logo: entry.logo,
    region: entry.region,
    tier: entry.tier,
    competitionFormat: competitionFormatForEntry(entry),
    season: seasonLabelForEntry(entry, seasonYear),
    teams: 0,
    matchday: 0,
    liveMatches: 0,
    standings: [],
    fixtures: [],
  };
}

export function getLeagueCatalogShells(): LeagueProfile[] {
  return LEAGUE_CATALOG.map(buildLeagueCatalogShell);
}

/** Default league loaded on /leagues first paint (2 API calls). */
export const FEATURED_LEAGUE_ID = "premier-league";
