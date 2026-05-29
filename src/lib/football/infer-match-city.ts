/** Infer a geocoding city when API-Football omits venue.city */
const LEAGUE_CITY_RULES: { pattern: RegExp; city: string }[] = [
  // Australia
  { pattern: /\bvictoria\b/i, city: "Melbourne" },
  { pattern: /\bnew south wales\b|\bnsw\b/i, city: "Sydney" },
  { pattern: /\bsouth australia\b/i, city: "Adelaide" },
  { pattern: /\bqueensland\b/i, city: "Brisbane" },
  { pattern: /\bwestern australia\b/i, city: "Perth" },
  { pattern: /\btasmania\b/i, city: "Hobart" },
  { pattern: /\baustralian capital\b|\bact\b/i, city: "Canberra" },
  { pattern: /\bnorthern territory\b/i, city: "Darwin" },
  // United Kingdom
  { pattern: /\bscotland\b/i, city: "Glasgow" },
  { pattern: /\bwales\b/i, city: "Cardiff" },
  { pattern: /\bnorthern ireland\b/i, city: "Belfast" },
  { pattern: /\bengland\b|\bpremier league\b|\bchampionship\b|\bepl\b/i, city: "London" },
  // USA
  { pattern: /\bcalifornia\b|\bmls\b/i, city: "Los Angeles" },
  { pattern: /\bnew york\b/i, city: "New York" },
  { pattern: /\btexas\b/i, city: "Dallas" },
  { pattern: /\bflorida\b/i, city: "Miami" },
  // Spain
  { pattern: /\bcatalonia\b|\bla liga\b/i, city: "Barcelona" },
  { pattern: /\bmadrid\b/i, city: "Madrid" },
  // Germany / Italy / France (broad)
  { pattern: /\bbavaria\b|\bbundesliga\b/i, city: "Munich" },
  { pattern: /\bserie a\b|\blombardy\b/i, city: "Milan" },
  { pattern: /\bligue 1\b|\bîle-de-france\b/i, city: "Paris" },
];

export function inferCityFromLeague(league: string, country: string): string | null {
  const haystack = `${league} ${country}`;

  for (const rule of LEAGUE_CITY_RULES) {
    if (rule.pattern.test(haystack)) return rule.city;
  }

  return null;
}

export function resolveGeocodeCity(
  venueCity: string | null,
  league: string,
  country: string,
): string | null {
  if (venueCity?.trim()) return venueCity.trim();
  return inferCityFromLeague(league, country);
}
