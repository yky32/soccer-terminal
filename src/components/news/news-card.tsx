"use client";

import { ChevronRight } from "@/components/app-shell";
import { FootballLogo } from "@/components/overview/football-logo";
import {
  formatNewsRelativeTime,
  formatNewsTimestamp,
} from "@/lib/data/format-news-date";
import type { NewsArticle } from "@/lib/data/news-article";
import {
  getCategoryAccent,
  getCategoryAccentBar,
  isRecentNews,
  NewsCategoryBadge,
  NewsMetaLine,
  NewsThumbnail,
} from "@/components/news/news-shared";
import {
  newsEnter,
  newsFocus,
  newsGlass,
  newsGlassHover,
  newsGlassStrong,
} from "@/components/news/news-glass";
import { cn } from "@/lib/utils";

type NewsRowCardProps = {
  article: NewsArticle;
  onSelect: (article: NewsArticle) => void;
  className?: string;
  style?: React.CSSProperties;
};

export function NewsRowCard({ article, onSelect, className, style }: NewsRowCardProps) {
  const accentBar = getCategoryAccentBar(article.category);
  const isNew = isRecentNews(article.publishedAt);

  return (
    <button
      type="button"
      onClick={() => onSelect(article)}
      style={style}
      className={cn(
        newsGlass,
        newsGlassHover,
        newsFocus,
        newsEnter,
        "group relative flex w-full gap-4 overflow-hidden p-3 text-left sm:gap-5 sm:p-4",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 z-[2] w-[3px] scale-y-0 opacity-0 transition-transform duration-300 group-hover:scale-y-100 group-hover:opacity-100",
          accentBar,
        )}
      />

      <div className="relative z-[1] h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-black/[0.06] sm:h-[4.5rem] sm:w-[4.5rem]">
        <NewsThumbnail article={article} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
      </div>

      <div className="relative z-[1] min-w-0 flex-1">
        <div className="flex items-start gap-2">
          {isNew ? (
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-label="New" />
          ) : null}
          <h3 className="line-clamp-2 text-[1rem] font-semibold leading-snug tracking-[-0.01em] text-neutral-950 sm:text-[1.0625rem]">
            {article.headline}
          </h3>
        </div>
        <p className="mt-1.5 line-clamp-1 text-[0.875rem] leading-relaxed text-neutral-600 sm:line-clamp-2">
          {article.excerpt}
        </p>
        <div className="mt-2 hidden sm:block">
          <NewsMetaLine article={article} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 sm:hidden">
          <NewsCategoryBadge category={article.category} compact />
          <time
            dateTime={article.publishedAt}
            className="text-[0.8125rem] tabular-nums text-neutral-500"
          >
            {formatNewsRelativeTime(article.publishedAt)}
          </time>
        </div>
      </div>

      <span className="relative z-[1] shrink-0 self-center">
        <ChevronRight />
      </span>
    </button>
  );
}

type NewsFeaturedCardProps = {
  article: NewsArticle;
  onSelect: (article: NewsArticle) => void;
};

export function NewsFeaturedCard({ article, onSelect }: NewsFeaturedCardProps) {
  const accent = getCategoryAccent(article.category);

  return (
    <button
      type="button"
      onClick={() => onSelect(article)}
      className={cn(
        newsGlassStrong,
        newsGlassHover,
        newsFocus,
        "group w-full overflow-hidden text-left",
        "border-l-[3px]",
        accent,
      )}
    >
      <div className="relative aspect-[2.4/1] min-h-[180px] overflow-hidden sm:min-h-[220px]">
        <NewsThumbnail
          article={article}
          className="absolute inset-0 h-full w-full transition-transform duration-300 group-hover:scale-[1.01]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5 transition-opacity duration-500 group-hover:from-black/80" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-white/75">
              Lead story
            </span>
            <NewsCategoryBadge category={article.category} compact />
            <time
              dateTime={article.publishedAt}
              className="text-[0.8125rem] font-semibold tabular-nums text-white/80"
              title={formatNewsTimestamp(article.publishedAt)}
            >
              {formatNewsRelativeTime(article.publishedAt)}
            </time>
          </div>
          <h2 className="mt-3 max-w-3xl text-[1.25rem] font-semibold leading-snug tracking-[-0.02em] text-white sm:text-[1.5rem]">
            {article.headline}
          </h2>
        </div>
      </div>

      <div className="news-glass-inset relative z-[1] flex flex-col gap-4 border-t border-black/[0.06] p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <p className="max-w-3xl text-[0.9375rem] leading-relaxed text-neutral-600 sm:text-[1rem]">
          {article.excerpt}
        </p>
        <div className="flex shrink-0 items-center gap-2 text-[0.9375rem] font-semibold text-foreground">
          <FootballLogo src={article.leagueLogo} label={article.league} size="sm" />
          <span>{article.league}</span>
          <ChevronRight />
        </div>
      </div>
    </button>
  );
}
