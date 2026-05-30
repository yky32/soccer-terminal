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

const PLACEHOLDER_GRADIENT: Record<NewsArticle["category"], string> = {
  transfer: "from-amber-100 via-amber-50 to-orange-100",
  "match-report": "from-emerald-100 via-emerald-50 to-teal-100",
  preview: "from-sky-100 via-sky-50 to-cyan-100",
  injury: "from-rose-100 via-rose-50 to-red-100",
  analysis: "from-violet-100 via-violet-50 to-indigo-100",
};

export function NewsThumbnail({
  article,
  className,
}: {
  article: NewsArticle;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const gradient = PLACEHOLDER_GRADIENT[article.category];

  if (failed) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
          gradient,
          className,
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.9), transparent 55%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.35), transparent 45%)",
          }}
          aria-hidden
        />
        <span className="relative text-[1.125rem] leading-none" aria-hidden>
          ⚽
        </span>
        <span className="sr-only">{article.imageAlt}</span>
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
    <p className={cn("truncate text-[0.8125rem] text-neutral-500", className)}>
      <span className="font-medium text-neutral-600">{article.league}</span>
      <span aria-hidden="true"> · </span>
      <span className="font-medium text-neutral-600">{meta.label}</span>
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
