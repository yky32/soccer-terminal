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
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="news-drawer-title"
        className={cn(
          "relative flex h-full w-full max-w-xl flex-col border-l border-black/[0.08] bg-background shadow-2xl",
          "transition-transform duration-300 ease-out",
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <NewsCategoryBadge category={article.category} />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-[0.875rem] font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
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

        <div className="border-t border-border bg-surface/50 px-5 py-4 sm:px-6">
          <Link
            href="/"
            onClick={onClose}
            className="inline-flex w-full items-center justify-center rounded-xl bg-foreground px-4 py-3 text-[0.9375rem] font-semibold text-background transition-opacity hover:opacity-90"
          >
            Open Global map
          </Link>
        </div>
      </div>
    </div>
  );
}
