export function matchHref(fixtureId: number) {
  return `/matches/${fixtureId}`;
}

export function parseFixtureId(id: string): number | null {
  const value = Number(id);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function fixtureDetailHref(fixture: { id: string }): string | null {
  const fixtureId = parseFixtureId(fixture.id);
  return fixtureId ? matchHref(fixtureId) : null;
}
