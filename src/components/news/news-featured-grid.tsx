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
  NewsCategoryBadge,
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

type NewsFeaturedGridProps = {
  lead: NewsArticle;
  secondary: NewsArticle[];
  onSelect: (article: NewsArticle) => void;
  className?: string;
};

export function NewsFeaturedGrid({
  lead,
  secondary,
  onSelect,
  className,
}: NewsFeaturedGridProps) {
  return (
    <div
      className={cn(
        newsEnter,
        "grid gap-2 sm:gap-2.5 lg:grid-cols-[7fr_3fr] lg:items-stretch",
        className,
      )}
    >
      <NewsFeaturedLead article={lead} onSelect={onSelect} />

      {secondary.length > 0 ? (
        <div className="grid grid-rows-2 gap-2 sm:grid-rows-4 lg:h-full lg:min-h-0">
          {secondary.map((article, index) => (
            <NewsFeaturedCompactRow
              key={article.id}
              article={article}
              onSelect={onSelect}
              style={{ animationDelay: `${index * 45}ms` }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NewsFeaturedLead({
  article,
  onSelect,
}: {
  article: NewsArticle;
  onSelect: (article: NewsArticle) => void;
}) {
  const accent = getCategoryAccent(article.category);

  return (
    <button
      type="button"
      onClick={() => onSelect(article)}
      className={cn(
        newsGlassStrong,
        newsGlassHover,
        newsFocus,
        "group flex h-full min-h-[16rem] flex-col overflow-hidden text-left sm:min-h-[18rem] lg:min-h-[20rem]",
        "border-l-[3px]",
        accent,
      )}
    >
      <div className="relative min-h-[9rem] flex-1 overflow-hidden sm:min-h-[10rem]">
        <NewsThumbnail
          article={article}
          className="absolute inset-0 h-full w-full transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-white/75 sm:text-[0.75rem]">
              Lead story
            </span>
            <NewsCategoryBadge category={article.category} compact />
            <time
              dateTime={article.publishedAt}
              className="text-[0.75rem] font-semibold tabular-nums text-white/80 sm:text-[0.8125rem]"
              title={formatNewsTimestamp(article.publishedAt)}
            >
              {formatNewsRelativeTime(article.publishedAt)}
            </time>
          </div>
          <h2 className="mt-1.5 line-clamp-3 text-[1rem] font-semibold leading-snug tracking-[-0.02em] text-white sm:text-[1.125rem]">
            {article.headline}
          </h2>
        </div>
      </div>

      <div className="news-glass-inset relative z-[1] flex shrink-0 flex-col gap-2 border-t border-black/[0.06] p-3 sm:p-3.5">
        <p className="line-clamp-2 text-[0.8125rem] leading-snug text-neutral-600 sm:text-[0.875rem]">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-2 text-[0.875rem] font-semibold text-neutral-950">
          <FootballLogo src={article.leagueLogo} label={article.league} size="sm" />
          <span className="truncate">{article.league}</span>
          <ChevronRight />
        </div>
      </div>
    </button>
  );
}

function NewsFeaturedCompactRow({
  article,
  onSelect,
  className,
  style,
}: {
  article: NewsArticle;
  onSelect: (article: NewsArticle) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
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
        "group flex h-full min-h-0 items-center gap-2 overflow-hidden p-2 text-left sm:gap-2.5 sm:p-2.5",
        className,
      )}
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-black/[0.06] sm:h-14 sm:w-14">
        <NewsThumbnail
          article={article}
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="relative z-[1] min-w-0 flex-1">
        <h3 className="line-clamp-2 text-[0.75rem] font-semibold leading-snug tracking-[-0.01em] text-neutral-950 sm:text-[0.8125rem]">
          {article.headline}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <NewsCategoryBadge category={article.category} compact />
          <time
            dateTime={article.publishedAt}
            className="text-[0.75rem] tabular-nums text-neutral-500"
            title={formatNewsTimestamp(article.publishedAt)}
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
