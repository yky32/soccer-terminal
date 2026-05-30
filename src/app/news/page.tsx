import { NewsFeed } from "@/components/news/news-feed";
import { NewsPageBackdrop } from "@/components/news/news-page-backdrop";
import { PageHeader } from "@/components/page-header";
import { getMockNewsArticles, getMockNewsLeagues } from "@/lib/data/mock-news";

export const metadata = {
  title: "News",
};

export default function NewsPage() {
  const articles = getMockNewsArticles();
  const leagues = getMockNewsLeagues(articles);

  return (
    <div className="news-page min-h-full">
      <NewsPageBackdrop />
      <div className="relative z-[1]">
        <PageHeader
          compact
          title="Football headlines."
          description="Transfers, match reports, and breaking stories — curated by league and easy to scan at a glance."
        />
        <NewsFeed articles={articles} leagues={leagues} />
      </div>
    </div>
  );
}
