import { LeaguesFeed } from "@/components/leagues/leagues-feed";
import { PageHeader } from "@/components/page-header";
import { getMockLeagues } from "@/lib/data/mock-leagues";

export const metadata = {
  title: "Leagues",
};

export default function LeaguesPage() {
  const leagues = getMockLeagues();

  return (
    <>
      <PageHeader
        compact
        onGlass
        title="League dashboards."
        description="Standings, upcoming fixtures, and quick links into the global map and news wire — organized by region and tier."
      />
      <LeaguesFeed leagues={leagues} />
    </>
  );
}
