import { notFound } from "next/navigation";
import { MatchDetailPanel } from "@/components/matches/match-detail-panel";
import { fetchMatchDetail } from "@/lib/football/data";
import { buildPageMetadata } from "@/lib/metadata";

type MatchPageProps = {
  params: Promise<{ fixtureId: string }>;
};

export async function generateMetadata({ params }: MatchPageProps) {
  const { fixtureId } = await params;
  const id = Number(fixtureId);
  const detail = Number.isFinite(id) ? await fetchMatchDetail(id) : null;

  if (!detail) {
    return buildPageMetadata({
      title: "Match not found",
      index: false,
    });
  }

  const { match } = detail;
  const title = `${match.homeTeam} vs ${match.awayTeam}`;

  return buildPageMetadata({
    title,
    description: `${match.league} — match facts, lineups, and head-to-head.`,
    path: `/matches/${fixtureId}`,
  });
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
