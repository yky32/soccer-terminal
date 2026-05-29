type GeoPoint = { latitude: number; longitude: number };

const cache = new Map<string, GeoPoint | null>();

export async function geocodeCity(
  city: string,
  countryCode: string,
): Promise<GeoPoint | null> {
  const trimmedCity = city.trim();
  if (!trimmedCity) return null;

  const key = `${trimmedCity.toLowerCase()}|${countryCode.toUpperCase()}`;
  if (cache.has(key)) return cache.get(key) ?? null;

  try {
    const params = new URLSearchParams({
      name: trimmedCity,
      count: "1",
      language: "en",
      country_code: countryCode.toUpperCase(),
    });

    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`,
      { next: { revalidate: 86_400 } },
    );

    if (!response.ok) {
      cache.set(key, null);
      return null;
    }

    const data = (await response.json()) as {
      results?: { latitude: number; longitude: number }[];
    };

    const hit = data.results?.[0];
    const point = hit
      ? { latitude: hit.latitude, longitude: hit.longitude }
      : null;

    cache.set(key, point);
    return point;
  } catch {
    cache.set(key, null);
    return null;
  }
}
