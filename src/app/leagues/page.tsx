import { LeaguesFeed } from "@/components/leagues/leagues-feed";
import { PageHeader } from "@/components/page-header";
import { getMockLeagues } from "@/lib/data/mock-leagues";
import { getMockNewsArticles } from "@/lib/data/mock-news";

export const metadata = {
  title: "Leagues",
};

export default function LeaguesPage() {
  const leagues = getMockLeagues();
  const articles = getMockNewsArticles();

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
