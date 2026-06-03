import { notFound } from "next/navigation";
import { NewsArticleDetail } from "@/components/news/news-article-detail";
import { NewsWireBootstrap } from "@/components/news/news-wire-bootstrap";
import {
  fetchNewsArticleById,
  fetchNewsArticles,
  fetchRelatedNewsArticles,
} from "@/lib/football/data";
import { ENABLE_NEWS } from "@/lib/feature-flags";
import { buildPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

type NewsArticlePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: NewsArticlePageProps) {
  if (!ENABLE_NEWS) {
    return buildPageMetadata({ title: "Not found", index: false });
  }

  const { id } = await params;
  const article = await fetchNewsArticleById(id);

  if (!article) {
    return buildPageMetadata({ title: "Article not found", index: false });
  }

  return buildPageMetadata({
    title: article.headline,
    description: article.excerpt,
    path: `/news/${id}`,
    openGraph: {
      type: "article",
      images: [
        {
          url: article.imageUrl,
          alt: article.imageAlt,
        },
      ],
    },
  });
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  if (!ENABLE_NEWS) {
    notFound();
  }

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
