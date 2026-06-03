import { notFound } from "next/navigation";
import { PlayerDetailPanel } from "@/components/players/player-detail-panel";
import {
  fetchPlayerProfile,
  findPlayerBySlug,
} from "@/lib/football/data";
import { buildPageMetadata } from "@/lib/metadata";
import {
  formatPlayerPageDescription,
  formatPlayerPageTitle,
} from "@/lib/seo/detail-metadata";
import { parseReturnTo } from "@/lib/return-navigation";

export const dynamic = "force-dynamic";

type PlayerPageProps = {
  params: Promise<{ leagueId: string; playerSlug: string }>;
  searchParams: Promise<{ from?: string }>;
};

export async function generateMetadata({ params }: PlayerPageProps) {
  const { leagueId, playerSlug } = await params;
  const match = await findPlayerBySlug(leagueId, playerSlug);

  if (!match) {
    return buildPageMetadata({
      title: "Player not found",
      index: false,
    });
  }

  return buildPageMetadata({
    title: formatPlayerPageTitle(match),
    description: formatPlayerPageDescription(match),
    path: `/leagues/${leagueId}/players/${playerSlug}`,
  });
}

export default async function PlayerPage({ params, searchParams }: PlayerPageProps) {
  const { leagueId, playerSlug } = await params;
  const { from } = await searchParams;
  const returnTo = parseReturnTo(from);
  const match = await findPlayerBySlug(leagueId, playerSlug);

  if (!match) {
    notFound();
  }

  const player = await fetchPlayerProfile(match);

  return (
    <div className="page-container pb-14 pt-6 sm:pb-16 sm:pt-8">
      <PlayerDetailPanel player={player} returnTo={returnTo} />
    </div>
  );
}
