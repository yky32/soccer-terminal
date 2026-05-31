import { notFound } from "next/navigation";
import { NewsArticleDetail } from "@/components/news/news-article-detail";
import { NewsWireBootstrap } from "@/components/news/news-wire-bootstrap";
import {
  fetchNewsArticleById,
  fetchNewsArticles,
  fetchRelatedNewsArticles,
} from "@/lib/football/data";

export const dynamic = "force-dynamic";

type NewsArticlePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: NewsArticlePageProps) {
  const { id } = await params;
  const article = await fetchNewsArticleById(id);

  if (!article) {
    return { title: "Article not found" };
  }

  return {
    title: article.headline,
    description: article.excerpt,
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { id } = await params;
  const article = await fetchNewsArticleById(id);

  if (!article) {
    notFound();
  }

  const [related, wireHeadlines] = await Promise.all([
    fetchRelatedNewsArticles(article),
    fetchNewsArticles(),
  ]);

  return (
    <>
      <NewsWireBootstrap headlines={wireHeadlines} />
      <div className="page-container pb-14 pt-6 sm:pb-16 sm:pt-8">
        <NewsArticleDetail article={article} related={related} />
      </div>
    </>
  );
}
