import { LeaguesPageShell } from "@/components/leagues/leagues-page-shell";
import { fetchFeaturedLeague, fetchLeagueCatalog } from "@/lib/football/data";
import { getCatalogEntryById } from "@/lib/football/league-catalog";
import { buildPageMetadata } from "@/lib/metadata";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

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

  const [catalog, initialLeague] = await Promise.all([
    fetchLeagueCatalog(),
    fetchFeaturedLeague(),
  ]);

  return (
    <LeaguesPageShell
      catalog={catalog}
      initialLeague={initialLeague}
      selectedLeagueId={initialLeague?.id ?? null}
    />
  );
}
