"use client";

import { useState } from "react";
import {
  formatNewsRelativeTime,
  formatNewsTimestamp,
} from "@/lib/data/format-news-date";
import { NEWS_CATEGORY_META, type NewsArticle } from "@/lib/data/news-article";
import { cn } from "@/lib/utils";

export function isRecentNews(isoDate: string, hours = 2) {
  return Date.now() - new Date(isoDate).getTime() < hours * 3_600_000;
}

export function NewsThumbnail({
  article,
  className,
}: {
  article: NewsArticle;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-surface-hover text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-muted-light",
          className,
        )}
      >
        —
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- mock CDN / Unsplash assets
    <img
      src={article.imageUrl}
      alt={article.imageAlt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}

export function NewsCategoryBadge({
  category,
  compact = false,
  className,
}: {
  category: NewsArticle["category"];
  compact?: boolean;
  className?: string;
}) {
  const meta = NEWS_CATEGORY_META[category];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full font-semibold uppercase tracking-[0.06em] ring-1 ring-inset",
        compact ? "px-2 py-0.5 text-[0.6875rem]" : "px-2.5 py-0.5 text-[0.8125rem]",
        meta.badge,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

export function NewsMetaLine({
  article,
  className,
}: {
  article: NewsArticle;
  className?: string;
}) {
  const meta = NEWS_CATEGORY_META[article.category];

  return (
    <p className={cn("truncate text-[0.8125rem] text-muted-light", className)}>
      <span className="font-medium text-muted">{article.league}</span>
      <span aria-hidden="true"> · </span>
      <span className="font-medium text-muted">{meta.label}</span>
      <span aria-hidden="true"> · </span>
      <time dateTime={article.publishedAt} title={formatNewsTimestamp(article.publishedAt)}>
        {formatNewsRelativeTime(article.publishedAt)}
      </time>
    </p>
  );
}

export function getCategoryAccent(category: NewsArticle["category"]) {
  return NEWS_CATEGORY_META[category].accent;
}

export function getCategoryAccentBar(category: NewsArticle["category"]) {
  return NEWS_CATEGORY_META[category].accentBar;
}
