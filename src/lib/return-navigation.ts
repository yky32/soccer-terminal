/** Safe in-app return paths from `?from=` (no open redirects). */
export function parseReturnTo(value: string | undefined | null): string | null {
  if (!value?.trim()) return null;

  const path = value.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (path.includes("://")) return null;

  const pathname = path.split("?")[0]?.split("#")[0] ?? "";
  if (!pathname.startsWith("/")) return null;

  return path;
}

export function appendReturnTo(href: string, returnTo: string): string {
  const [pathname, search = ""] = href.split("?");
  const params = new URLSearchParams(search);
  params.set("from", returnTo);
  const query = params.toString();
  return query ? `${pathname}?${query}` : `${pathname}?from=${encodeURIComponent(returnTo)}`;
}

export function returnLabelForPath(returnTo: string): string {
  if (returnTo.startsWith("/matches/")) return "Back to match";
  if (returnTo.startsWith("/leagues/")) return "Back to league";
  return "Back";
}
