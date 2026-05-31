import { LeaguesFeed } from "@/components/leagues/leagues-feed";
import { PageHeader } from "@/components/page-header";
import { fetchLeagues, fetchNewsArticles } from "@/lib/football/data";

export const metadata = {
  title: "Leagues",
};

export default async function LeaguesPage() {
  const [leagues, articles] = await Promise.all([fetchLeagues(), fetchNewsArticles()]);

  return (
    <>
      <PageHeader
        compact
        onGlass
        title="League dashboards."
        description="Standings, upcoming fixtures, and quick links into the global map and news wire — organized by region and tier."
      />
      <LeaguesFeed leagues={leagues} articles={articles} />
    </>
  );
}
