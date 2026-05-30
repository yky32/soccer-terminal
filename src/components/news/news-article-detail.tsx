import Link from "next/link";
import { FootballLogo } from "@/components/overview/football-logo";
import {
  formatNewsRelativeTime,
  formatNewsTimestamp,
} from "@/lib/data/format-news-date";
import {
  getArticleBody,
  getArticleReadingMinutes,
} from "@/lib/data/news-article-body";
import type { NewsArticle } from "@/lib/data/news-article";
import {
  getCategoryAccent,
  getCategoryAccentBar,
  NEWS_CATEGORY_META,
} from "@/lib/data/news-article";
import {
  NewsCategoryBadge,
  NewsThumbnail,
} from "@/components/news/news-shared";
import {
  newsEnter,
  newsFocus,
  newsGlass,
  newsGlassHover,
  newsGlassStrong,
  newsGlassSubtle,
} from "@/components/news/news-glass";
import { newsArticleHref } from "@/lib/news-paths";
import { cn } from "@/lib/utils";

type NewsArticleDetailProps = {
  article: NewsArticle;
  related: NewsArticle[];
};

export function NewsArticleDetail({ article, related }: NewsArticleDetailProps) {
  const accent = getCategoryAccent(article.category);
  const accentBar = getCategoryAccentBar(article.category);
  const categoryMeta = NEWS_CATEGORY_META[article.category];
  const paragraphs = getArticleBody(article).split("\n\n").filter(Boolean);
  const readingMinutes = getArticleReadingMinutes(article);

  return (
    <article className={cn(newsEnter, "mx-auto max-w-6xl")}>
      <Link
        href="/news"
        className={cn(
          newsGlassSubtle,
          newsFocus,
          "mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.875rem] font-medium text-muted transition-colors hover:text-foreground",
        )}
      >
        <BackIcon />
        Back to Wire
      </Link>

      <div className={cn(newsGlassStrong, "overflow-hidden")}>
        <div className="relative aspect-[21/9] max-h-[26rem] min-h-[12rem] overflow-hidden sm:min-h-[14rem]">
          <NewsThumbnail article={article} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/5" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <NewsCategoryBadge category={article.category} />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[0.8125rem] font-medium text-white ring-1 ring-white/20 backdrop-blur-sm">
                <FootballLogo src={article.leagueLogo} label={article.league} size="xs" />
                {article.league}
              </span>
            </div>
          </div>
        </div>

        <div className={cn("border-l-[4px] px-5 py-7 sm:px-8 sm:py-9", accent)}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-muted">
            <time dateTime={article.publishedAt} title={formatNewsTimestamp(article.publishedAt)}>
              {formatNewsRelativeTime(article.publishedAt)}
            </time>
            <span aria-hidden>·</span>
            <span>{readingMinutes} min read</span>
            <span aria-hidden>·</span>
            <span className="font-medium text-neutral-600">{categoryMeta.label}</span>
          </div>

          <h1 className="mt-4 max-w-4xl text-[clamp(1.625rem,4.5vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-foreground">
            {article.headline}
          </h1>

          <p className="mt-5 max-w-3xl text-[1.0625rem] leading-relaxed text-neutral-600 sm:text-[1.125rem]">
            {article.excerpt}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-start">
        <div className={cn(newsGlass, "px-5 py-7 sm:px-8 sm:py-8")}>
          <div className="space-y-5">
            {paragraphs.map((paragraph, index) => (
              <p
                key={`${article.id}-p-${index}`}
                className={cn(
                  "text-[0.9375rem] leading-[1.75] text-neutral-700 sm:text-[1rem]",
                  index === 0 && "text-[1rem] font-medium text-neutral-800 sm:text-[1.0625rem]",
                )}
              >
                {paragraph}
              </p>
            ))}
          </div>

          <footer className="mt-10 flex flex-wrap items-center gap-3 border-t border-black/[0.06] pt-6">
            <span className={cn("h-1 w-10 rounded-full", accentBar)} aria-hidden />
            <p className="text-[0.875rem] text-muted">
              Coverage from the Soccer World Monitor wire. Follow live fixtures on the Global map.
            </p>
            <Link
              href="/"
              className={cn(
                newsFocus,
                "ml-auto inline-flex items-center justify-center rounded-xl bg-foreground px-4 py-2.5 text-[0.875rem] font-semibold text-background transition-transform hover:scale-[1.02] active:scale-[0.98]",
              )}
            >
              Open Global map
            </Link>
          </footer>
        </div>

        {related.length > 0 ? (
          <aside className={cn(newsGlass, "p-4 sm:p-5")}>
            <div className="flex items-center gap-2 border-b border-black/[0.06] pb-3">
              <FootballLogo src={article.leagueLogo} label={article.league} size="sm" />
              <h2 className="text-[0.875rem] font-semibold tracking-[-0.01em] text-foreground">
                More in {article.league}
              </h2>
            </div>

            <ul className="mt-3 space-y-2">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={newsArticleHref(item.id)}
                    className={cn(
                      newsGlassSubtle,
                      newsGlassHover,
                      newsFocus,
                      "group flex gap-3 rounded-xl p-2.5 transition-colors",
                    )}
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-black/[0.06]">
                      <NewsThumbnail
                        article={item}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-3 text-[0.8125rem] font-semibold leading-snug tracking-[-0.01em] text-neutral-950">
                        {item.headline}
                      </p>
                      <time
                        dateTime={item.publishedAt}
                        className="mt-1 block text-[0.75rem] tabular-nums text-neutral-500"
                        title={formatNewsTimestamp(item.publishedAt)}
                      >
                        {formatNewsRelativeTime(item.publishedAt)}
                      </time>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/news"
              className={cn(
                newsFocus,
                "mt-4 flex w-full items-center justify-center rounded-xl border border-black/[0.08] px-3 py-2.5 text-[0.8125rem] font-semibold text-foreground transition-colors hover:bg-black/[0.03]",
              )}
            >
              View all headlines
            </Link>
          </aside>
        ) : null}
      </div>
    </article>
  );
}

function BackIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
