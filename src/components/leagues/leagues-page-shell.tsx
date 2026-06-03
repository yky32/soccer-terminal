import { LeaguesFeed } from "@/components/leagues/leagues-feed";
import { PageHeader } from "@/components/page-header";
import type { LeagueProfile } from "@/lib/data/league-profile";

type LeaguesPageShellProps = {
  catalog: LeagueProfile[];
  initialLeague: LeagueProfile | null;
  selectedLeagueId: string | null;
};

export function LeaguesPageShell({
  catalog,
  initialLeague,
  selectedLeagueId,
}: LeaguesPageShellProps) {
  return (
    <>
      <PageHeader
        compact
        onGlass
        title="League dashboards."
        description="Standings, upcoming fixtures, and quick links into the global map — organized by region and tier."
      />
      <LeaguesFeed
        catalog={catalog}
        initialLeague={initialLeague}
        selectedLeagueId={selectedLeagueId}
      />
    </>
  );
}
