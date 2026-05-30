import type { Feature, Polygon } from "geojson";
import type { LeagueProfile } from "@/lib/data/league-profile";
import { getCountryCentroid } from "@/lib/football/country-centroids";

export type LeagueMapLocation = {
  code: string;
  label: string;
  latitude: number;
  longitude: number;
  zoom: number;
  zoneRadiusKm: number;
};

const NAME_TO_CODE: Record<string, string> = {
  Spain: "ES",
  Italy: "IT",
  Germany: "DE",
  France: "FR",
  Brazil: "BR",
  Mexico: "MX",
  Turkey: "TR",
  Portugal: "PT",
  Netherlands: "NL",
  Japan: "JP",
  "South Korea": "KR",
  "Saudi Arabia": "SA",
  Australia: "AU",
  "United States": "US",
};

const COUNTRY_ZOOM = 3.25;

const LOCATION_OVERRIDES: Record<string, LeagueMapLocation> = {
  England: {
    code: "GB",
    label: "England",
    latitude: 52.5,
    longitude: -1.5,
    zoom: COUNTRY_ZOOM,
    zoneRadiusKm: 165,
  },
  Scotland: {
    code: "SCT",
    label: "Scotland",
    latitude: 56.49,
    longitude: -4.2,
    zoom: COUNTRY_ZOOM,
    zoneRadiusKm: 140,
  },
  Europe: {
    code: "EU",
    label: "Europe",
    latitude: 50.11,
    longitude: 8.68,
    zoom: 2.9,
    zoneRadiusKm: 520,
  },
};

function zoomForCode(code: string) {
  switch (code) {
    case "US":
    case "BR":
    case "AU":
      return 2.6;
    case "MX":
      return 2.8;
    case "SA":
      return 2.9;
    default:
      return COUNTRY_ZOOM;
  }
}

function zoneRadiusForCode(code: string, country: string) {
  if (country === "Europe") return 520;
  if (code === "GB" || code === "SCT") return 155;
  if (code === "US" || code === "BR" || code === "AU") return 780;
  if (code === "MX") return 520;
  if (code === "SA") return 420;
  return 280;
}

/** Approximate circle polygon for map zone highlights (no turf dependency). */
export function createLeagueZonePolygon(
  longitude: number,
  latitude: number,
  radiusKm: number,
  points = 72,
): Feature<Polygon> {
  const latRad = (latitude * Math.PI) / 180;
  const kmPerDegreeLat = 110.574;
  const kmPerDegreeLng = 111.32 * Math.cos(latRad);
  const ring: [number, number][] = [];

  for (let index = 0; index <= points; index += 1) {
    const theta = (index / points) * Math.PI * 2;
    ring.push([
      longitude + (radiusKm / kmPerDegreeLng) * Math.cos(theta),
      latitude + (radiusKm / kmPerDegreeLat) * Math.sin(theta),
    ]);
  }

  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [ring],
    },
  };
}

export function getLeagueMapLocation(league: LeagueProfile): LeagueMapLocation {
  const override = LOCATION_OVERRIDES[league.country];
  if (override) return override;

  const code = NAME_TO_CODE[league.country];
  if (code) {
    const centroid = getCountryCentroid(code);
    if (centroid) {
      return {
        code,
        label: league.country,
        latitude: centroid.latitude,
        longitude: centroid.longitude,
        zoom: zoomForCode(code),
        zoneRadiusKm: zoneRadiusForCode(code, league.country),
      };
    }
  }

  return LOCATION_OVERRIDES.Europe;
}
