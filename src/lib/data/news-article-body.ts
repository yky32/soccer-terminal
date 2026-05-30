import type { NewsArticle } from "@/lib/data/news-article";

export function getArticleBody(article: NewsArticle) {
  if (article.body) return article.body;

  return `${article.excerpt}\n\nFurther reporting will follow as sources confirm additional details around this story. Check the Global map for live and upcoming fixtures in ${article.league}.`;
}

export function getArticleReadingMinutes(article: NewsArticle) {
  const words = getArticleBody(article).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
