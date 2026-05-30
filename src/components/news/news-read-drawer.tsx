"use client";

import { useEffect } from "react";
import Link from "next/link";
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
  newsDrawerEnter,
  newsFocus,
  newsGlassStrong,
} from "@/components/news/news-glass";
import { cn } from "@/lib/utils";

type NewsReadDrawerProps = {
  article: NewsArticle | null;
  onClose: () => void;
};

function getArticleBody(article: NewsArticle) {
  if (article.body) return article.body;

  return `${article.excerpt}\n\nFurther reporting will follow as sources confirm additional details around this story. Check the Global map for live and upcoming fixtures in ${article.league}.`;
}

export function NewsReadDrawer({ article, onClose }: NewsReadDrawerProps) {
  useEffect(() => {
    if (!article) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [article, onClose]);

  if (!article) return null;

  const accent = getCategoryAccent(article.category);
  const paragraphs = getArticleBody(article).split("\n\n").filter(Boolean);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button
        type="button"
        aria-label="Close article"
        onClick={onClose}
        className="absolute inset-0 bg-black/20 backdrop-blur-xl transition-opacity duration-300"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="news-drawer-title"
        className={cn(
          newsGlassStrong,
          newsDrawerEnter,
          "relative flex h-full w-full max-w-xl flex-col border-l border-black/[0.08] shadow-2xl",
        )}
      >
        <div className="news-glass-inset relative z-[1] flex items-center justify-between gap-4 border-b border-black/[0.06] px-5 py-4">
          <NewsCategoryBadge category={article.category} />
          <button
            type="button"
            onClick={onClose}
            className={cn(
              newsFocus,
              "rounded-full px-3 py-1.5 text-[0.875rem] font-medium text-muted transition-all duration-200 hover:bg-black/[0.05] hover:text-foreground",
            )}
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="relative aspect-[16/9] overflow-hidden">
            <NewsThumbnail article={article} className="h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          <div className={cn("border-l-[3px] px-5 py-6 sm:px-6", accent)}>
            <div className="flex flex-wrap items-center gap-2 text-[0.8125rem] text-muted">
              <FootballLogo src={article.leagueLogo} label={article.league} size="sm" />
              <span className="font-medium">{article.league}</span>
              <span aria-hidden>·</span>
              <time dateTime={article.publishedAt} title={formatNewsTimestamp(article.publishedAt)}>
                {formatNewsRelativeTime(article.publishedAt)}
              </time>
            </div>

            <h2
              id="news-drawer-title"
              className="mt-4 text-[1.375rem] font-semibold leading-snug tracking-[-0.02em] text-foreground sm:text-[1.5rem]"
            >
              {article.headline}
            </h2>

            <div className="mt-6 space-y-4">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-[0.9375rem] leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="news-glass-inset border-t border-black/[0.06] px-5 py-4 sm:px-6">
          <Link
            href="/"
            onClick={onClose}
            className={cn(
              newsFocus,
              "inline-flex w-full items-center justify-center rounded-xl bg-foreground px-4 py-3 text-[0.9375rem] font-semibold text-background transition-all hover:scale-[1.01] active:scale-[0.99]",
            )}
          >
            Open Global map
          </Link>
        </div>
      </div>
    </div>
  );
}
