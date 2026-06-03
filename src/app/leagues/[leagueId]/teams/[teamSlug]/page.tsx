import { notFound } from "next/navigation";
import { TeamDetailPanel } from "@/components/teams/team-detail-panel";
import { getTeamNewsArticles } from "@/lib/data/team-news";
import { ENABLE_NEWS } from "@/lib/feature-flags";
import {
  fetchNewsArticles,
  fetchTeamProfile,
} from "@/lib/football/data";
import { buildPageMetadata } from "@/lib/metadata";
import {
  formatTeamPageDescription,
  formatTeamPageTitle,
} from "@/lib/seo/detail-metadata";

export const dynamic = "force-dynamic";

type TeamPageProps = {
  params: Promise<{ leagueId: string; teamSlug: string }>;
};

export async function generateMetadata({ params }: TeamPageProps) {
  const { leagueId, teamSlug } = await params;
  const team = await fetchTeamProfile(leagueId, teamSlug);

  if (!team) {
    return buildPageMetadata({
      title: "Team not found",
      index: false,
    });
  }

  return buildPageMetadata({
    title: formatTeamPageTitle(team),
    description: formatTeamPageDescription(team),
    path: `/leagues/${leagueId}/teams/${teamSlug}`,
  });
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { leagueId, teamSlug } = await params;
  const team = await fetchTeamProfile(leagueId, teamSlug);

  if (!team) {
    notFound();
  }

  const articles = ENABLE_NEWS ? await fetchNewsArticles() : [];
  const teamNews = ENABLE_NEWS ? getTeamNewsArticles(articles, team.name) : [];

  return (
    <div className="page-container pb-14 pt-6 sm:pb-16 sm:pt-8">
      <TeamDetailPanel team={team} articles={articles} teamNews={teamNews} />
    </div>
  );
}
