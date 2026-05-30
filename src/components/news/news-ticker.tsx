"use client";

import type { NewsArticle } from "@/lib/data/news-article";
import { formatNewsRelativeTime } from "@/lib/data/format-news-date";

type NewsTickerProps = {
  headlines: NewsArticle[];
};

export function NewsTicker({ headlines }: NewsTickerProps) {
  if (headlines.length === 0) return null;

  const items = [...headlines, ...headlines];

  return (
    <div className="border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="page-container flex items-center gap-4 py-2.5">
        <span className="shrink-0 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-muted">
          Wire
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="news-ticker-track flex w-max gap-8">
            {items.map((article, index) => (
              <span
                key={`${article.id}-${index}`}
                className="inline-flex shrink-0 items-center gap-3 text-[0.8125rem] text-foreground"
              >
                <span className="font-medium">{article.headline}</span>
                <span className="text-muted-light">
                  {formatNewsRelativeTime(article.publishedAt)}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
