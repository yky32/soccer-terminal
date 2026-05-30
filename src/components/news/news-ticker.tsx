"use client";

import { useMemo } from "react";
import { FootballLogo } from "@/components/overview/football-logo";
import type { NewsArticle } from "@/lib/data/news-article";
import { formatNewsRelativeTime } from "@/lib/data/format-news-date";
import { findTeamsInHeadline } from "@/lib/data/news-team-registry";
import { newsGlassInset, newsGlassSubtle } from "@/components/news/news-glass";
import { cn } from "@/lib/utils";

type NewsTickerProps = {
  headlines: NewsArticle[];
  embedded?: boolean;
};

export function NewsTicker({ headlines, embedded = false }: NewsTickerProps) {
  if (headlines.length === 0) return null;

  const items = [...headlines, ...headlines];

  return (
    <div
      className={cn(
        embedded ? "news-wire-ticker min-w-0 w-full" : newsGlassSubtle,
        !embedded && "rounded-none border-x-0 border-t-0",
      )}
    >
      <div
        className={cn(
          "flex items-center",
          embedded
            ? cn(newsGlassInset, "news-wire-ticker__capsule min-w-0 gap-2 rounded-full py-1 pl-1 pr-2.5 sm:gap-2.5 sm:pr-3")
            : "page-container gap-4 py-2.5",
        )}
      >
        <WireBadge embedded={embedded} />

        <div className="news-wire-ticker__viewport relative min-w-0 flex-1 overflow-hidden">
          <div className="news-ticker-track flex w-max items-center gap-6 sm:gap-8">
            {items.map((article, index) => (
              <WireTickerItem
                key={`${article.id}-${index}`}
                article={article}
                embedded={embedded}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WireTickerItem({
  article,
  embedded,
}: {
  article: NewsArticle;
  embedded: boolean;
}) {
  const teams = useMemo(() => findTeamsInHeadline(article.headline), [article.headline]);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 text-foreground sm:gap-2.5",
        embedded ? "text-[0.8125rem]" : "text-[0.875rem]",
      )}
    >
      <span className="news-wire-ticker__bullet" aria-hidden />

      {teams.length > 0 ? (
        <span className="inline-flex shrink-0 items-center -space-x-1">
          {teams.map((team) => (
            <span
              key={team.id}
              className="news-wire-ticker__team-badge inline-flex items-center justify-center rounded-full bg-white/75 p-0.5 ring-1 ring-black/[0.06] shadow-sm"
              title={team.name}
            >
              <FootballLogo src={team.logo} label={team.name} size="xs" />
            </span>
          ))}
        </span>
      ) : null}

      <span className="font-semibold tracking-[-0.01em]">{article.headline}</span>
      <span
        className={cn(
          "shrink-0 font-medium tabular-nums text-muted-light",
          embedded ? "text-[0.6875rem]" : "text-[0.75rem]",
        )}
      >
        {formatNewsRelativeTime(article.publishedAt)}
      </span>
    </span>
  );
}

function WireBadge({ embedded }: { embedded: boolean }) {
  return (
    <div
      className={cn(
        "news-wire-badge relative flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full font-bold uppercase",
        embedded
          ? "px-2.5 py-1 text-[0.625rem] tracking-[0.16em] sm:px-3 sm:text-[0.6875rem]"
          : "px-3 py-1.5 text-[0.6875rem] tracking-[0.18em]",
      )}
    >
      <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
        <span className="news-wire-badge__ping absolute inset-0 rounded-full" />
        <span className="news-wire-badge__dot relative m-auto h-1.5 w-1.5 rounded-full" />
      </span>
      <span className="relative z-[1]">Wire</span>
    </div>
  );
}
