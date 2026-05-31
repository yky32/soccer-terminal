import { notFound } from "next/navigation";
import { TeamDetailPanel } from "@/components/teams/team-detail-panel";
import { getTeamNewsArticles } from "@/lib/data/team-mock";
import {
  fetchNewsArticles,
  fetchTeamProfile,
} from "@/lib/football/data";

export const dynamic = "force-dynamic";

type TeamPageProps = {
  params: Promise<{ leagueId: string; teamSlug: string }>;
};

export async function generateMetadata({ params }: TeamPageProps) {
  const { leagueId, teamSlug } = await params;
  const team = await fetchTeamProfile(leagueId, teamSlug);

  if (!team) {
    return { title: "Team not found" };
  }

  return {
    title: `${team.name} · ${team.league.shortName}`,
    description: `${team.name} overview, table, fixtures, squad, and news in ${team.league.name}.`,
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { leagueId, teamSlug } = await params;
  const [team, articles] = await Promise.all([
    fetchTeamProfile(leagueId, teamSlug),
    fetchNewsArticles(),
  ]);

  if (!team) {
    notFound();
  }

  const teamNews = getTeamNewsArticles(articles, team.name);

  return (
    <div className="page-container pb-14 pt-6 sm:pb-16 sm:pt-8">
      <TeamDetailPanel team={team} articles={articles} teamNews={teamNews} />
    </div>
  );
}
