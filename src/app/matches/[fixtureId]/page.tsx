import { notFound } from "next/navigation";
import { MatchDetailPanel } from "@/components/matches/match-detail-panel";
import { fetchMatchDetail } from "@/lib/football/data";

type MatchPageProps = {
  params: Promise<{ fixtureId: string }>;
};

export async function generateMetadata({ params }: MatchPageProps) {
  const { fixtureId } = await params;
  const id = Number(fixtureId);
  const detail = Number.isFinite(id) ? await fetchMatchDetail(id) : null;

  if (!detail) {
    return { title: "Match not found" };
  }

  const { match } = detail;
  return {
    title: `${match.homeTeam} vs ${match.awayTeam}`,
    description: `${match.league} — match facts, lineups, and head-to-head.`,
  };
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { fixtureId } = await params;
  const id = Number(fixtureId);

  if (!Number.isFinite(id) || id <= 0) {
    notFound();
  }

  const detail = await fetchMatchDetail(id);

  if (!detail) {
    notFound();
  }

  return <MatchDetailPanel detail={detail} />;
}
