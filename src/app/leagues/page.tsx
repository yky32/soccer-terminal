import { LeaguesFeed } from "@/components/leagues/leagues-feed";
import { PageHeader } from "@/components/page-header";
import { fetchFeaturedLeague, fetchLeagueCatalog } from "@/lib/football/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Leagues",
};

export default async function LeaguesPage() {
  const [catalog, initialLeague] = await Promise.all([
    fetchLeagueCatalog(),
    fetchFeaturedLeague(),
  ]);

  return (
    <>
      <PageHeader
        compact
        onGlass
        title="League dashboards."
        description="Standings, upcoming fixtures, and quick links into the global map and news wire — organized by region and tier."
      />
      <LeaguesFeed catalog={catalog} initialLeague={initialLeague} />
    </>
  );
}
