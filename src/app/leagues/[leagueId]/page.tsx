import { notFound } from "next/navigation";
import { LeaguesPageShell } from "@/components/leagues/leagues-page-shell";
import { SeoIntroBlock } from "@/components/seo/seo-intro-block";
import { fetchLeagueCatalog } from "@/lib/football/data";
import { getCatalogEntryById } from "@/lib/football/league-catalog";
import { buildPageMetadata } from "@/lib/metadata";
import {
  formatLeaguePageDescription,
  formatLeaguePageTitle,
} from "@/lib/seo/detail-metadata";
import { buildLeaguePageIntro } from "@/lib/seo/page-intros";

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
    title: formatLeaguePageTitle(entry.name),
    description: formatLeaguePageDescription(entry),
    path: `/leagues/${leagueId}`,
  });
}

export default async function LeaguePage({ params }: LeaguePageProps) {
  const { leagueId } = await params;
  const entry = getCatalogEntryById(leagueId);

  if (!entry) {
    notFound();
  }

  const catalog = await fetchLeagueCatalog();

  return (
    <>
      <LeaguesPageShell
        catalog={catalog}
        initialLeague={null}
        selectedLeagueId={leagueId}
      />
      <div className="page-container pb-14">
        <SeoIntroBlock paragraphs={buildLeaguePageIntro(entry)} />
      </div>
    </>
  );
}
