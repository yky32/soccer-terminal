"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "@/components/app-shell";
import { FootballLogo } from "@/components/overview/football-logo";
import {
  getCategoryAccent,
  getCategoryAccentBar,
  isRecentNews,
  NewsCategoryBadge,
  NewsThumbnail,
} from "@/components/news/news-shared";
import type { NewsSectionKind, NewsSectionPlan } from "@/lib/data/news-page-layout";
import {
  formatNewsRelativeTime,
  formatNewsTimestamp,
} from "@/lib/data/format-news-date";
import type { NewsArticle } from "@/lib/data/news-article";
import {
  newsEnter,
  newsFocus,
  newsGlass,
  newsGlassHover,
  newsGlassStrong,
  newsGlassSubtle,
} from "@/components/news/news-glass";
import { cn } from "@/lib/utils";

type NewsSectionRendererProps = {
  section: NewsSectionPlan;
  onSelect: (article: NewsArticle) => void;
  latestVisibleCount?: number;
  onLoadMore?: () => void;
  timelineSource?: NewsArticle[];
  className?: string;
};

export function NewsSectionRenderer({
  section,
  onSelect,
  latestVisibleCount,
  onLoadMore,
  timelineSource,
  className,
}: NewsSectionRendererProps) {
  const timelineArticles = timelineSource ?? section.articles;
  const hasContent =
    section.kind === "timeline" ? timelineArticles.length > 0 : section.articles.length > 0;

  if (!hasContent) return null;

  return (
    <section className={cn("space-y-2.5", className)} aria-labelledby={section.id}>
      <SectionHeader id={section.id} title={section.title} subtitle={section.subtitle} kind={section.kind} />

      {section.kind === "breaking-wide" ? (
        <BreakingWide articles={section.articles} onSelect={onSelect} />
      ) : null}
      {section.kind === "breaking-stack" ? (
        <BreakingStack articles={section.articles} onSelect={onSelect} />
      ) : null}
      {section.kind === "spotlight" ? (
        <SpotlightStrip articles={section.articles} onSelect={onSelect} />
      ) : null}
      {section.kind === "quick-scan" ? (
        <QuickScanGrid articles={section.articles} onSelect={onSelect} />
      ) : null}
      {section.kind === "timeline" ? (
        <TimelineSection articles={timelineArticles} onSelect={onSelect} />
      ) : null}
      {section.kind === "digest" ? (
        <DigestSection articles={section.articles} onSelect={onSelect} />
      ) : null}
      {section.kind === "mosaic" ? (
        <MosaicSection articles={section.articles} onSelect={onSelect} />
      ) : null}
      {section.kind === "latest" ? (
        <LatestSection
          articles={section.articles}
          visibleCount={latestVisibleCount ?? section.articles.length}
          onSelect={onSelect}
          onLoadMore={onLoadMore}
        />
      ) : null}
    </section>
  );
}

function SectionHeader({
  id,
  title,
  subtitle,
  kind,
}: {
  id: string;
  title: string;
  subtitle: string;
  kind: NewsSectionKind;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-black/[0.06] pb-1.5">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <h2 id={id} className="text-[0.9375rem] font-semibold tracking-[-0.02em] text-neutral-950">
          {title}
        </h2>
        {subtitle ? <p className="text-[0.75rem] text-neutral-500">{subtitle}</p> : null}
      </div>
      {(kind === "breaking-wide" || kind === "breaking-stack") && (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-rose-700 ring-1 ring-inset ring-rose-500/20">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/70" />
            <span className="relative m-auto h-1 w-1 rounded-full bg-rose-500" />
          </span>
          Live
        </span>
      )}
    </div>
  );
}

function BreakingWide({
  articles,
  onSelect,
}: {
  articles: NewsArticle[];
  onSelect: (article: NewsArticle) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {articles.map((article, index) => (
        <button
          key={article.id}
          type="button"
          onClick={() => onSelect(article)}
          style={{ animationDelay: `${index * 50}ms` }}
          className={cn(newsFocus, newsEnter, "group relative h-40 w-[min(72vw,14rem)] shrink-0 overflow-hidden rounded-xl text-left sm:h-44 sm:w-[15rem]")}
        >
          <NewsThumbnail article={article} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-3">
            <NewsCategoryBadge category={article.category} compact className="bg-white/15 text-white ring-white/20" />
            <h3 className="mt-1.5 line-clamp-2 text-[0.8125rem] font-semibold leading-snug text-white">
              {article.headline}
            </h3>
            <p className="mt-0.5 text-[0.6875rem] tabular-nums text-white/75">
              {formatNewsRelativeTime(article.publishedAt)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

function BreakingStack({
  articles,
  onSelect,
}: {
  articles: NewsArticle[];
  onSelect: (article: NewsArticle) => void;
}) {
  return (
    <div className={cn(newsGlassStrong, "divide-y divide-black/[0.06] overflow-hidden")}>
      {articles.map((article, index) => (
        <button
          key={article.id}
          type="button"
          onClick={() => onSelect(article)}
          style={{ animationDelay: `${index * 45}ms` }}
          className={cn(newsEnter, newsFocus, "group flex w-full gap-3 p-2.5 text-left sm:gap-3.5 sm:p-3")}
        >
          <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg sm:h-[4.5rem] sm:w-[5.5rem]">
            <NewsThumbnail article={article} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <span className="absolute left-1.5 top-1.5 rounded-full bg-rose-500 px-1.5 py-px text-[0.5625rem] font-bold uppercase tracking-[0.08em] text-white">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <NewsCategoryBadge category={article.category} compact />
            <h3 className="mt-1 line-clamp-2 text-[0.875rem] font-semibold leading-snug text-neutral-950 sm:text-[0.9375rem]">
              {article.headline}
            </h3>
            <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-snug text-neutral-600">
              {article.excerpt}
            </p>
            <p className="mt-1 text-[0.75rem] tabular-nums text-neutral-500">
              {formatNewsRelativeTime(article.publishedAt)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

function SpotlightStrip({
  articles,
  onSelect,
}: {
  articles: NewsArticle[];
  onSelect: (article: NewsArticle) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3 sm:gap-2.5">
      {articles.map((article, index) => (
        <button
          key={article.id}
          type="button"
          onClick={() => onSelect(article)}
          style={{ animationDelay: `${index * 60}ms` }}
          className={cn(
            newsGlass,
            newsGlassHover,
            newsFocus,
            newsEnter,
            "group overflow-hidden text-left",
            index === 0 ? "sm:row-span-1" : "",
          )}
        >
          <div className={cn("relative overflow-hidden", index === 0 ? "aspect-[5/4] sm:aspect-[4/3]" : "aspect-[16/10]")}>
            <NewsThumbnail article={article} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
              <FootballLogo src={article.leagueLogo} label={article.league} size="sm" />
              <h3 className="mt-1 line-clamp-2 text-[0.8125rem] font-semibold leading-snug text-white sm:text-[0.875rem]">
                {article.headline}
              </h3>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function QuickScanGrid({
  articles,
  onSelect,
}: {
  articles: NewsArticle[];
  onSelect: (article: NewsArticle) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
      {articles.map((article, index) => (
        <button
          key={article.id}
          type="button"
          onClick={() => onSelect(article)}
          style={{ animationDelay: `${index * 35}ms` }}
          className={cn(newsGlass, newsGlassHover, newsFocus, newsEnter, "group overflow-hidden text-left")}
        >
          <div className="relative aspect-[16/10] overflow-hidden">
            <NewsThumbnail article={article} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          </div>
          <div className="space-y-1 p-2 sm:p-2.5">
            <NewsCategoryBadge category={article.category} compact />
            <h3 className="line-clamp-2 text-[0.75rem] font-semibold leading-snug text-neutral-950 sm:text-[0.8125rem]">
              {article.headline}
            </h3>
            <time dateTime={article.publishedAt} className="text-[0.75rem] tabular-nums text-neutral-500">
              {formatNewsRelativeTime(article.publishedAt)}
            </time>
          </div>
        </button>
      ))}
    </div>
  );
}

const PREMIER_LEAGUE = "Premier League";
const TIMELINE_MAX_ITEMS = 10;

function TimelineSection({
  articles,
  onSelect,
}: {
  articles: NewsArticle[];
  onSelect: (article: NewsArticle) => void;
}) {
  const sorted = [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  const globalArticles = sorted.slice(0, TIMELINE_MAX_ITEMS);
  const pl = sorted
    .filter((article) => article.league === PREMIER_LEAGUE)
    .slice(0, TIMELINE_MAX_ITEMS);
  const world = sorted.filter((article) => article.league !== PREMIER_LEAGUE);
  const plLogo = pl[0]?.leagueLogo ?? null;

  return (
    <div className="grid gap-2 md:grid-cols-3 md:gap-3">
      <TimelineLane
        label="Global"
        accent="bg-gradient-to-r from-sky-400 to-cyan-500"
        icon={<TimelineLaneEmoji>🌐</TimelineLaneEmoji>}
        articles={globalArticles}
        onSelect={onSelect}
        showLeague
      />
      <TimelineLane
        label="PL"
        accent="bg-gradient-to-r from-neutral-700 to-neutral-900"
        icon={<FootballLogo src={plLogo} label={PREMIER_LEAGUE} size="xs" />}
        articles={pl}
        onSelect={onSelect}
      />
      <WorldTimelineLane articles={world} onSelect={onSelect} />
    </div>
  );
}

function groupArticlesByLeague(articles: NewsArticle[]) {
  const byLeague = new Map<string, NewsArticle[]>();

  for (const article of articles) {
    const bucket = byLeague.get(article.league) ?? [];
    bucket.push(article);
    byLeague.set(article.league, bucket);
  }

  return [...byLeague.entries()]
    .map(([league, items]) => ({
      league,
      leagueLogo: items[0]?.leagueLogo ?? null,
      articles: [...items]
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, TIMELINE_MAX_ITEMS),
    }))
    .sort((a, b) => a.league.localeCompare(b.league));
}

function WorldTimelineLane({
  articles,
  onSelect,
}: {
  articles: NewsArticle[];
  onSelect: (article: NewsArticle) => void;
}) {
  const leagues = useMemo(() => groupArticlesByLeague(articles), [articles]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [leagues]);

  useEffect(() => {
    if (paused || leagues.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % leagues.length);
    }, 10_000);

    return () => window.clearInterval(timer);
  }, [leagues.length, paused]);

  const active = leagues[index] ?? null;
  const accent = "bg-gradient-to-r from-violet-400 to-indigo-500";

  return (
    <div
      className={cn(newsGlass, "overflow-hidden")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="flex items-center justify-between gap-3 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn("h-2 w-2 shrink-0 rounded-full", accent)} aria-hidden />
          <TimelineLaneEmoji>🌍</TimelineLaneEmoji>
          <p className="text-[0.8125rem] font-semibold tracking-[-0.01em] text-neutral-950">World</p>
        </div>

        {active ? (
          <div className="flex min-w-0 items-center gap-2">
            {active.leagueLogo ? (
              <FootballLogo src={active.leagueLogo} label={active.league} size="xs" />
            ) : null}
            <p
              key={active.league}
              className={cn(
                "max-w-[5.5rem] truncate text-[0.8125rem] font-medium text-neutral-600 sm:max-w-[7rem]",
                newsEnter,
              )}
            >
              {active.league}
            </p>
            {leagues.length > 1 ? (
              <div className="flex shrink-0 items-center gap-1" role="tablist" aria-label="World leagues">
                {leagues.map((league, leagueIndex) => (
                  <button
                    key={league.league}
                    type="button"
                    role="tab"
                    aria-label={`Show ${league.league}`}
                    aria-selected={leagueIndex === index}
                    onClick={() => setIndex(leagueIndex)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      leagueIndex === index
                        ? "w-3.5 bg-neutral-800"
                        : "w-1.5 bg-neutral-300 hover:bg-neutral-400",
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {active && active.articles.length > 0 ? (
        <TimelineTrack
          key={active.league}
          articles={active.articles}
          onSelect={onSelect}
        />
      ) : (
        <p className="px-3 pb-3 text-[0.8125rem] text-neutral-500">No headlines.</p>
      )}
    </div>
  );
}

function TimelineLaneEmoji({ children }: { children: string }) {
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-black/[0.04] text-[0.875rem] leading-none"
      aria-hidden
    >
      {children}
    </span>
  );
}

function TimelineLane({
  label,
  accent,
  icon = null,
  articles,
  onSelect,
  showLeague = false,
}: {
  label: string;
  accent: string;
  icon?: React.ReactNode;
  articles: NewsArticle[];
  onSelect: (article: NewsArticle) => void;
  showLeague?: boolean;
}) {
  return (
    <div className={cn(newsGlass, "overflow-hidden")}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className={cn("h-2 w-2 shrink-0 rounded-full", accent)} aria-hidden />
        {icon}
        <p className="text-[0.8125rem] font-semibold tracking-[-0.01em] text-neutral-950">{label}</p>
      </div>

      {articles.length > 0 ? (
        <TimelineTrack articles={articles} onSelect={onSelect} showLeague={showLeague} />
      ) : (
        <p className="px-3 pb-3 text-[0.8125rem] text-neutral-500">No headlines.</p>
      )}
    </div>
  );
}

function TimelineTrack({
  articles,
  onSelect,
  showLeague = false,
}: {
  articles: NewsArticle[];
  onSelect: (article: NewsArticle) => void;
  showLeague?: boolean;
}) {
  return (
    <ol className="space-y-0 px-3 pb-3">
      {articles.map((article, index) => {
        const isLast = index === articles.length - 1;

        return (
          <li key={article.id} className="grid grid-cols-[1.125rem_minmax(0,1fr)] gap-x-3">
            <div className="flex flex-col items-center self-stretch pt-2.5">
              <span
                className={cn(
                  "z-[1] h-2 w-2 shrink-0 rounded-full ring-[3px] ring-[#eef1f6]",
                  getCategoryAccentBar(article.category),
                )}
                aria-hidden
              />
              {!isLast ? (
                <span className="mt-1.5 w-px flex-1 bg-gradient-to-b from-neutral-300/80 to-neutral-200/40" aria-hidden />
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => onSelect(article)}
              style={{ animationDelay: `${index * 45}ms` }}
              title={formatNewsTimestamp(article.publishedAt)}
              className={cn(
                newsGlassSubtle,
                newsGlassHover,
                newsFocus,
                newsEnter,
                "group mb-2.5 flex w-full gap-2.5 overflow-hidden rounded-xl p-2 text-left last:mb-0 sm:p-2.5",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <time
                    dateTime={article.publishedAt}
                    className="text-[0.6875rem] font-medium tabular-nums text-neutral-500"
                  >
                    {formatNewsRelativeTime(article.publishedAt)}
                  </time>
                  <NewsCategoryBadge category={article.category} compact />
                </div>
                <h3 className="mt-1 line-clamp-2 text-[0.8125rem] font-semibold leading-snug tracking-[-0.01em] text-neutral-950">
                  {article.headline}
                </h3>
                {showLeague ? (
                  <p className="mt-1 truncate text-[0.6875rem] text-neutral-500">{article.league}</p>
                ) : null}
              </div>
              <div className="relative hidden h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-black/[0.06] sm:block">
                <NewsThumbnail
                  article={article}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function DigestSection({
  articles,
  onSelect,
}: {
  articles: NewsArticle[];
  onSelect: (article: NewsArticle) => void;
}) {
  return (
    <div className={cn(newsGlassStrong, "overflow-hidden")}>
      <ol className="divide-y divide-black/[0.06]">
        {articles.map((article, index) => (
          <li key={article.id}>
            <button
              type="button"
              onClick={() => onSelect(article)}
              style={{ animationDelay: `${index * 40}ms` }}
              className={cn(newsEnter, newsFocus, "group flex w-full gap-2.5 px-3 py-2.5 text-left sm:gap-3 sm:px-3.5 sm:py-3")}
            >
              <span className="text-[1.5rem] font-bold tabular-nums leading-none text-neutral-300 transition-colors group-hover:text-neutral-400 sm:text-[1.75rem]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <NewsCategoryBadge category={article.category} compact />
                  <span className="text-[0.75rem] font-medium text-neutral-500">{article.league}</span>
                </div>
                <h3 className="mt-1 text-[0.9375rem] font-semibold leading-snug tracking-[-0.01em] text-neutral-950 sm:text-[1rem]">
                  {article.headline}
                </h3>
                <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-snug text-neutral-600">
                  {article.excerpt}
                </p>
              </span>
              <ChevronRight />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function MosaicSection({
  articles,
  onSelect,
}: {
  articles: NewsArticle[];
  onSelect: (article: NewsArticle) => void;
}) {
  const spans = ["col-span-2 row-span-2", "col-span-1 row-span-1", "col-span-1 row-span-1", "col-span-2 row-span-1"];

  return (
    <div className="grid auto-rows-[minmax(6rem,1fr)] grid-cols-2 gap-2 sm:auto-rows-[minmax(6.5rem,1fr)] sm:gap-2.5">
      {articles.map((article, index) => (
        <button
          key={article.id}
          type="button"
          onClick={() => onSelect(article)}
          style={{ animationDelay: `${index * 45}ms` }}
          className={cn(
            newsFocus,
            newsEnter,
            "group relative min-h-[6rem] overflow-hidden rounded-xl text-left sm:min-h-[6.5rem]",
            spans[index] ?? "col-span-1 row-span-1",
            getCategoryAccent(article.category),
            "border-l-[3px]",
          )}
        >
          <NewsThumbnail article={article} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/30 to-black/5" />
          <div className="absolute inset-x-0 bottom-0 p-2 sm:p-2.5">
            <h3 className={cn("font-semibold leading-snug text-white", index === 0 ? "line-clamp-3 text-[0.875rem]" : "line-clamp-2 text-[0.75rem]")}>
              {article.headline}
            </h3>
          </div>
        </button>
      ))}
    </div>
  );
}

function LatestSection({
  articles,
  visibleCount,
  onSelect,
  onLoadMore,
}: {
  articles: NewsArticle[];
  visibleCount: number;
  onSelect: (article: NewsArticle) => void;
  onLoadMore?: () => void;
}) {
  const visible = articles.slice(0, visibleCount);
  const groups = groupLatestByDate(visible);

  return (
    <div className={cn(newsGlassStrong, "overflow-hidden")}>
      <div className="news-glass-inset flex items-center justify-between border-b border-black/[0.06] px-3 py-2">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Wire stream
        </p>
        <p className="text-[0.75rem] tabular-nums text-neutral-500">
          {visible.length} / {articles.length}
        </p>
      </div>

      <div className="divide-y divide-black/[0.06]">
        {groups.map((group) => (
          <section key={group.label} aria-label={group.label}>
            <div className="sticky top-0 z-[1] border-b border-black/[0.04] bg-[#eef1f6]/80 px-3 py-1.5 backdrop-blur-sm">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                {group.label}
              </p>
            </div>
            <ul>
              {group.articles.map((article, index) => (
                <LatestStreamRow
                  key={article.id}
                  article={article}
                  onSelect={onSelect}
                  featured={group.label === "Today" && index === 0}
                  style={{ animationDelay: `${index * 40}ms` }}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {visibleCount < articles.length && onLoadMore ? (
        <button
          type="button"
          onClick={onLoadMore}
          className={cn(
            newsFocus,
            "w-full border-t border-black/[0.06] py-2.5 text-[0.8125rem] font-semibold text-neutral-700 transition-colors hover:bg-black/[0.03] hover:text-neutral-950",
          )}
        >
          Load more headlines
        </button>
      ) : null}
    </div>
  );
}

const LATEST_DATE_GROUPS = ["Today", "Yesterday", "This week", "Earlier"] as const;

function latestDateGroup(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const day = 86_400_000;

  if (diff < day) return "Today";
  if (diff < day * 2) return "Yesterday";
  if (diff < day * 7) return "This week";
  return "Earlier";
}

function groupLatestByDate(articles: NewsArticle[]) {
  const buckets = new Map<string, NewsArticle[]>();

  for (const article of articles) {
    const label = latestDateGroup(article.publishedAt);
    const bucket = buckets.get(label) ?? [];
    bucket.push(article);
    buckets.set(label, bucket);
  }

  return LATEST_DATE_GROUPS.filter((label) => buckets.has(label)).map((label) => ({
    label,
    articles: buckets.get(label) ?? [],
  }));
}

function LatestStreamRow({
  article,
  onSelect,
  featured = false,
  style,
}: {
  article: NewsArticle;
  onSelect: (article: NewsArticle) => void;
  featured?: boolean;
  style?: React.CSSProperties;
}) {
  const isNew = isRecentNews(article.publishedAt);

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(article)}
        style={style}
        className={cn(
          newsFocus,
          newsEnter,
          "group flex w-full gap-3 px-3 py-3 text-left transition-colors hover:bg-black/[0.025] sm:gap-4 sm:px-4",
          featured && "bg-black/[0.02] sm:py-4",
        )}
      >
        <div className="flex w-10 shrink-0 flex-col items-end pt-0.5 sm:w-11">
          <span
            className={cn(
              "mt-1 h-1.5 w-1.5 rounded-full",
              isNew ? "bg-emerald-500" : "bg-neutral-300 group-hover:bg-neutral-400",
            )}
            aria-hidden
          />
          <time
            dateTime={article.publishedAt}
            title={formatNewsTimestamp(article.publishedAt)}
            className="mt-auto text-[0.6875rem] font-medium tabular-nums leading-tight text-neutral-500"
          >
            {formatNewsRelativeTime(article.publishedAt)}
          </time>
        </div>

        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-lg border border-black/[0.06] bg-neutral-100",
            featured ? "h-20 w-28 sm:h-24 sm:w-36" : "h-14 w-20 sm:h-16 sm:w-24",
          )}
        >
          <NewsThumbnail
            article={article}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <NewsCategoryBadge category={article.category} compact />
            <span className="inline-flex items-center gap-1 text-[0.6875rem] font-medium text-neutral-500">
              <FootballLogo src={article.leagueLogo} label={article.league} size="xs" />
              {article.league}
            </span>
          </span>
          <h3
            className={cn(
              "mt-1 line-clamp-2 font-semibold leading-snug tracking-[-0.01em] text-neutral-950",
              featured ? "text-[0.9375rem] sm:text-[1rem]" : "text-[0.8125rem] sm:text-[0.875rem]",
            )}
          >
            {article.headline}
          </h3>
          <p
            className={cn(
              "mt-1 line-clamp-2 text-neutral-600",
              featured ? "text-[0.8125rem] leading-relaxed" : "text-[0.75rem] leading-snug",
            )}
          >
            {article.excerpt}
          </p>
        </span>

        <span className="hidden shrink-0 self-center opacity-40 transition-opacity group-hover:opacity-100 sm:block">
          <ChevronRight />
        </span>
      </button>
    </li>
  );
}
