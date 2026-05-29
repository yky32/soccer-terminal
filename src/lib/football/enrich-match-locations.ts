import type { LiveMatch } from "@/lib/data/live-match";
import { getCountryCentroid } from "@/lib/football/country-centroids";
import { geocodeCity } from "@/lib/football/geocode-city";
import { resolveGeocodeCity } from "@/lib/football/infer-match-city";

function locationKey(city: string, countryCode: string) {
  return `${city.trim().toLowerCase()}|${countryCode.toUpperCase()}`;
}

function coordGroupKey(latitude: number, longitude: number) {
  return `${latitude.toFixed(3)}|${longitude.toFixed(3)}`;
}

function spreadRadiusForGroup(total: number) {
  return Math.min(0.28, 0.05 + total * 0.025);
}

function spreadDuplicateCoordinates(
  latitude: number,
  longitude: number,
  index: number,
  total: number,
): [number, number] {
  if (total <= 1) return [latitude, longitude];

  const angle = (2 * Math.PI * index) / total;
  const radius = spreadRadiusForGroup(total);
  const latRad = (latitude * Math.PI) / 180;

  return [
    latitude + radius * Math.cos(angle),
    longitude + (radius * Math.sin(angle)) / Math.cos(latRad),
  ];
}

function geocodeQueryForMatch(match: LiveMatch) {
  return resolveGeocodeCity(match.venueCity, match.league, match.country);
}

export async function enrichMatchesWithLocations(
  matchesByCountry: Record<string, LiveMatch[]>,
): Promise<Record<string, LiveMatch[]>> {
  const cityLookups = new Map<string, { city: string; countryCode: string }>();

  for (const matches of Object.values(matchesByCountry)) {
    for (const match of matches) {
      const city = geocodeQueryForMatch(match);
      if (!city) continue;

      const key = locationKey(city, match.countryCode);
      if (!cityLookups.has(key)) {
        cityLookups.set(key, { city, countryCode: match.countryCode });
      }
    }
  }

  const geocoded = new Map<string, [number, number] | null>();

  await Promise.all(
    [...cityLookups.entries()].map(async ([key, { city, countryCode }]) => {
      const point = await geocodeCity(city, countryCode);
      geocoded.set(key, point ? [point.latitude, point.longitude] : null);
    }),
  );

  const enriched: Record<string, LiveMatch[]> = {};

  for (const [countryCode, matches] of Object.entries(matchesByCountry)) {
    const resolved = matches.map((match) => {
      const city = geocodeQueryForMatch(match);

      if (city) {
        const coords = geocoded.get(locationKey(city, match.countryCode));
        if (coords) {
          return { ...match, latitude: coords[0], longitude: coords[1] };
        }
      }

      const centroid = getCountryCentroid(match.countryCode);
      if (!centroid) {
        return { ...match, latitude: null, longitude: null };
      }

      return {
        ...match,
        latitude: centroid.latitude,
        longitude: centroid.longitude,
      };
    });

    const groups = new Map<string, LiveMatch[]>();
    for (const match of resolved) {
      if (match.latitude === null || match.longitude === null) continue;
      const key = coordGroupKey(match.latitude, match.longitude);
      const group = groups.get(key) ?? [];
      group.push(match);
      groups.set(key, group);
    }

    enriched[countryCode] = resolved.map((match) => {
      if (match.latitude === null || match.longitude === null) return match;

      const group =
        groups.get(coordGroupKey(match.latitude, match.longitude)) ?? [match];
      const index = group.findIndex((item) => item.id === match.id);
      const [latitude, longitude] = spreadDuplicateCoordinates(
        match.latitude,
        match.longitude,
        index,
        group.length,
      );

      return { ...match, latitude, longitude };
    });
  }

  return enriched;
}
