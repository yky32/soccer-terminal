export type RouteCachePolicy = {
  sMaxAge: number;
  staleWhileRevalidate?: number;
};

export function cacheControlHeader({ sMaxAge, staleWhileRevalidate }: RouteCachePolicy) {
  const swr = staleWhileRevalidate ?? sMaxAge * 2;
  return `public, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`;
}
