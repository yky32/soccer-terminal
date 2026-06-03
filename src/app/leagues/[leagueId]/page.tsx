import { notFound } from "next/navigation";
import { LeaguesPageShell } from "@/components/leagues/leagues-page-shell";
import { fetchLeagueCatalog } from "@/lib/football/data";
import { getCatalogEntryById } from "@/lib/football/league-catalog";
import { buildPageMetadata } from "@/lib/metadata";

/** League detail is fetched on the client; catalog shell is static. */
export const revalidate = 600;

type LeaguePageProps = {
  params: Promise<{ leagueId: string }>;
};

export async function generateMetadata({ params }: LeaguePageProps) {
  const { leagueId } = await params;
  const entry = getCatalogEntryById(leagueId);

  if (!entry) {
    return buildPageMetadata({
      title: "League not found",
      index: false,
    });
  }

  return buildPageMetadata({
    title: entry.name,
    description: `${entry.name} standings, fixtures, teams, and league leaders.`,
    path: `/leagues/${leagueId}`,
  });
}

export default async function LeaguePage({ params }: LeaguePageProps) {
  const { leagueId } = await params;

  if (!getCatalogEntryById(leagueId)) {
    notFound();
  }

  const catalog = await fetchLeagueCatalog();

  return (
    <LeaguesPageShell
      catalog={catalog}
      initialLeague={null}
      selectedLeagueId={leagueId}
    />
  );
}
