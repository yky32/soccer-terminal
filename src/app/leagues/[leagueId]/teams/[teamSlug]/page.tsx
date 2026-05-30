import { notFound } from "next/navigation";
import { TeamDetailPanel } from "@/components/teams/team-detail-panel";
import { getMockLeagueById } from "@/lib/data/mock-leagues";
import { getMockNewsArticles } from "@/lib/data/mock-news";
import { buildTeamProfile, getTeamNewsArticles } from "@/lib/data/team-mock";
import { findStandingBySlug, getAllTeamStaticParams } from "@/lib/team-paths";

type TeamPageProps = {
  params: Promise<{ leagueId: string; teamSlug: string }>;
};

export async function generateStaticParams() {
  return getAllTeamStaticParams();
}

export async function generateMetadata({ params }: TeamPageProps) {
  const { leagueId, teamSlug } = await params;
  const league = getMockLeagueById(leagueId);
  const standing = league ? findStandingBySlug(league, teamSlug) : null;

  if (!league || !standing) {
    return { title: "Team not found" };
  }

  return {
    title: `${standing.team} · ${league.shortName}`,
    description: `${standing.team} overview, table, fixtures, squad, and news in ${league.name}.`,
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { leagueId, teamSlug } = await params;
  const league = getMockLeagueById(leagueId);
  const standing = league ? findStandingBySlug(league, teamSlug) : null;

  if (!league || !standing) {
    notFound();
  }

  const team = buildTeamProfile(league, standing);
  const articles = getMockNewsArticles();
  const teamNews = getTeamNewsArticles(articles, team.name);

  return (
    <div className="page-container pb-14 pt-6 sm:pb-16 sm:pt-8">
      <TeamDetailPanel team={team} articles={articles} teamNews={teamNews} />
    </div>
  );
}
