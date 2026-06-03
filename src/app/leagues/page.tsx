import { LeaguesPageShell } from "@/components/leagues/leagues-page-shell";
import { fetchLeagueCatalog } from "@/lib/football/data";
import { FEATURED_LEAGUE_ID, getCatalogEntryById } from "@/lib/football/league-catalog";
import { buildPageMetadata } from "@/lib/metadata";
import { redirect } from "next/navigation";

/** Catalog is static; league detail loads client-side via /api/leagues/[id]. */
export const revalidate = 600;

export const metadata = buildPageMetadata({
  title: "Leagues",
  description: "Standings, fixtures, teams, and league leaders across top competitions.",
  path: "/leagues",
});

type LeaguesPageProps = {
  searchParams: Promise<{ league?: string }>;
};

export default async function LeaguesPage({ searchParams }: LeaguesPageProps) {
  const { league: legacyLeagueId } = await searchParams;

  if (legacyLeagueId && getCatalogEntryById(legacyLeagueId)) {
    redirect(`/leagues/${legacyLeagueId}`);
  }

  const catalog = await fetchLeagueCatalog();

  return (
    <LeaguesPageShell
      catalog={catalog}
      initialLeague={null}
      selectedLeagueId={FEATURED_LEAGUE_ID}
    />
  );
}
