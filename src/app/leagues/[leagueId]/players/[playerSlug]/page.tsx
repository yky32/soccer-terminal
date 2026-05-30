import { notFound } from "next/navigation";
import { PlayerDetailPanel } from "@/components/players/player-detail-panel";
import { buildPlayerProfile } from "@/lib/data/player-mock";
import { findPlayerBySlug, getAllPlayerStaticParams } from "@/lib/player-paths";

type PlayerPageProps = {
  params: Promise<{ leagueId: string; playerSlug: string }>;
};

export async function generateStaticParams() {
  return getAllPlayerStaticParams();
}

export async function generateMetadata({ params }: PlayerPageProps) {
  const { leagueId, playerSlug } = await params;
  const match = findPlayerBySlug(leagueId, playerSlug);

  if (!match) {
    return { title: "Player not found" };
  }

  return {
    title: `${match.name} · ${match.standing.team}`,
    description: `${match.name} profile, stats, match performance, and league form in ${match.league.name}.`,
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { leagueId, playerSlug } = await params;
  const match = findPlayerBySlug(leagueId, playerSlug);

  if (!match) {
    notFound();
  }

  const player = buildPlayerProfile(match.league, match.standing, match.slot);

  return (
    <div className="page-container pb-14 pt-6 sm:pb-16 sm:pt-8">
      <PlayerDetailPanel player={player} />
    </div>
  );
}
