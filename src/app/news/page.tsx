import { NewsFeed } from "@/components/news/news-feed";
import { PageHeader } from "@/components/page-header";
import { ENABLE_NEWS } from "@/lib/feature-flags";
import { fetchNewsArticles, getNewsLeaguesFromArticles } from "@/lib/football/data";
import { notFound } from "next/navigation";

export const metadata = {
  title: "News",
};

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  if (!ENABLE_NEWS) {
    notFound();
  }

  const articles = await fetchNewsArticles();
  const leagues = getNewsLeaguesFromArticles(articles);

  return (
    <>
      <PageHeader
        compact
        onGlass
        title="Football headlines."
        description="Transfers, match reports, and breaking stories — curated by league and easy to scan at a glance."
      />
      <NewsFeed articles={articles} leagues={leagues} />
    </>
  );
}
