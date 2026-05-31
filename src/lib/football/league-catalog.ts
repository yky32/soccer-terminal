import type { LeagueRegion, LeagueTier } from "@/lib/data/league-profile";

export type LeagueSeasonKind = "split" | "calendar";

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
};

const leagueLogo = (id: number) =>
  `https://media.api-sports.io/football/leagues/${id}.png`;

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
  },
  {
    id: "uecl",
    apiId: 848,
    name: "UEFA Conference League",
    shortName: "UECL",
    country: "Europe",
    countryFlag: "https://media.api-sports.io/flags/eu.svg",
    logo: leagueLogo(848),
    region: "europe",
    tier: "continental",
    newsLabel: "Conference League",
    seasonKind: "split",
  },
  {
    id: "championship",
    apiId: 40,
    name: "Championship",
    shortName: "Championship",
    country: "England",
    countryFlag: "https://media.api-sports.io/flags/gb-eng.svg",
    logo: leagueLogo(40),
    region: "europe",
    tier: "regional",
    newsLabel: "Championship",
    seasonKind: "split",
  },
  {
    id: "mls",
    apiId: 253,
    name: "MLS",
    shortName: "MLS",
    country: "United States",
    countryFlag: "https://media.api-sports.io/flags/us.svg",
    logo: leagueLogo(253),
    region: "americas",
    tier: "top-flight",
    newsLabel: "MLS",
    seasonKind: "calendar",
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
  {
    id: "k-league",
    apiId: 292,
    name: "K League 1",
    shortName: "K League",
    country: "South Korea",
    countryFlag: "https://media.api-sports.io/flags/kr.svg",
    logo: leagueLogo(292),
    region: "asia",
    tier: "top-flight",
    newsLabel: "K League",
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
    id: "eredivisie",
    apiId: 88,
    name: "Eredivisie",
    shortName: "Eredivisie",
    country: "Netherlands",
    countryFlag: "https://media.api-sports.io/flags/nl.svg",
    logo: leagueLogo(88),
    region: "europe",
    tier: "top-flight",
    newsLabel: "Eredivisie",
    seasonKind: "split",
  },
  {
    id: "liga-portugal",
    apiId: 94,
    name: "Liga Portugal",
    shortName: "Portugal",
    country: "Portugal",
    countryFlag: "https://media.api-sports.io/flags/pt.svg",
    logo: leagueLogo(94),
    region: "europe",
    tier: "top-flight",
    newsLabel: "Liga Portugal",
    seasonKind: "split",
  },
  {
    id: "nsw-npl",
    apiId: 192,
    name: "NSW NPL",
    shortName: "NSW NPL",
    country: "Australia",
    countryFlag: "https://media.api-sports.io/flags/au.svg",
    logo: leagueLogo(192),
    region: "oceania",
    tier: "regional",
    newsLabel: "NSW NPL",
    seasonKind: "calendar",
  },
  {
    id: "brasileirao",
    apiId: 71,
    name: "Brasileirão Série A",
    shortName: "Brasileirão",
    country: "Brazil",
    countryFlag: "https://media.api-sports.io/flags/br.svg",
    logo: leagueLogo(71),
    region: "americas",
    tier: "top-flight",
    newsLabel: "Brasileirão",
    seasonKind: "calendar",
  },
  {
    id: "liga-mx",
    apiId: 262,
    name: "Liga MX",
    shortName: "Liga MX",
    country: "Mexico",
    countryFlag: "https://media.api-sports.io/flags/mx.svg",
    logo: leagueLogo(262),
    region: "americas",
    tier: "top-flight",
    newsLabel: "Liga MX",
    seasonKind: "split",
  },
  {
    id: "super-lig",
    apiId: 203,
    name: "Süper Lig",
    shortName: "Süper Lig",
    country: "Turkey",
    countryFlag: "https://media.api-sports.io/flags/tr.svg",
    logo: leagueLogo(203),
    region: "europe",
    tier: "top-flight",
    newsLabel: "Süper Lig",
    seasonKind: "split",
  },
  {
    id: "scottish-prem",
    apiId: 179,
    name: "Scottish Premiership",
    shortName: "Scotland",
    country: "Scotland",
    countryFlag: "https://media.api-sports.io/flags/gb-sct.svg",
    logo: leagueLogo(179),
    region: "europe",
    tier: "top-flight",
    newsLabel: "Scottish Prem",
    seasonKind: "split",
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

  if (entry.seasonKind === "calendar") {
    return year;
  }

  return month >= 7 ? year : year - 1;
}

export function seasonLabelForEntry(entry: LeagueCatalogEntry, seasonYear: number) {
  if (entry.seasonKind === "calendar") {
    return String(seasonYear);
  }

  const next = String(seasonYear + 1).slice(-2);
  return `${seasonYear}/${next}`;
}
