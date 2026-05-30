import { notFound } from "next/navigation";
import { NewsArticleDetail } from "@/components/news/news-article-detail";
import { NewsPageBackdrop } from "@/components/news/news-page-backdrop";
import { NewsWireBootstrap } from "@/components/news/news-wire-bootstrap";
import {
  getMockNewsArticleById,
  getMockNewsArticles,
  getRelatedMockNewsArticles,
} from "@/lib/data/mock-news";

type NewsArticlePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return getMockNewsArticles().map((article) => ({ id: article.id }));
}

export async function generateMetadata({ params }: NewsArticlePageProps) {
  const { id } = await params;
  const article = getMockNewsArticleById(id);

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
  const article = getMockNewsArticleById(id);

  if (!article) {
    notFound();
  }

  const related = getRelatedMockNewsArticles(article);
  const wireHeadlines = getMockNewsArticles();

  return (
    <div className="news-page min-h-full">
      <NewsPageBackdrop />
      <NewsWireBootstrap headlines={wireHeadlines} />
      <div className="relative z-[1] page-container pb-14 pt-6 sm:pb-16 sm:pt-8">
        <NewsArticleDetail article={article} related={related} />
      </div>
    </div>
  );
}
