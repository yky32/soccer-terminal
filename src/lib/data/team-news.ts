import type { NewsArticle } from "@/lib/data/news-article";
import { findTeamsInText } from "@/lib/data/news-team-registry";

export function getTeamNewsArticles(articles: NewsArticle[], teamName: string, limit = 12) {
  const teamLower = teamName.toLowerCase();

  return articles
    .filter((article) => {
      const text = `${article.headline} ${article.excerpt}`;
      const detected = findTeamsInText(text, 4);
      if (detected.some((team) => team.name.toLowerCase() === teamLower)) return true;
      return text.toLowerCase().includes(teamLower);
    })
    .slice(0, limit);
}
