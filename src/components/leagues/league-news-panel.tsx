"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { NewsRowCard } from "@/components/news/news-card";
import {
  leaguesGlass,
  leaguesGlassFocus,
  leaguesGlassHover,
  leaguesGlassInsetBar,
} from "@/components/leagues/leagues-glass";
import type { LeagueProfile } from "@/lib/data/league-profile";
import type { NewsArticle } from "@/lib/data/news-article";
import { newsArticleHref } from "@/lib/news-paths";
import { cn } from "@/lib/utils";

type LeagueNewsPanelProps = {
  league: LeagueProfile;
  newsLabel: string;
  articles: NewsArticle[];
};

export function LeagueNewsPanel({ league, newsLabel, articles }: LeagueNewsPanelProps) {
  const router = useRouter();

  return (
    <section className={cn(leaguesGlass, "overflow-hidden")}>
      <header
        className={cn(
          leaguesGlassInsetBar,
          "flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] px-4 py-3 sm:px-5",
        )}
      >
        <div>
          <h2 className="text-[clamp(1.125rem,2.2vw,1.375rem)] font-semibold tracking-[-0.03em] text-neutral-950">
            {league.shortName} wire
          </h2>
          <p className="mt-0.5 text-[0.8125rem] text-neutral-500">
            Headlines tagged {newsLabel}
          </p>
        </div>
        <Link
          href="/news"
          className={cn(
            leaguesGlassHover,
            leaguesGlassFocus,
            "rounded-full px-3 py-1.5 text-[0.8125rem] font-medium text-neutral-800 hover:bg-white/50",
          )}
        >
          All news
        </Link>
      </header>

      {articles.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <p className="text-[1rem] font-semibold text-neutral-950">No wire stories yet</p>
          <p className="mt-2 text-[0.875rem] text-neutral-600">
            Coverage for {league.name} will appear here as it hits the desk.
          </p>
          <Link
            href="/news"
            className={cn(
              leaguesGlassHover,
              leaguesGlassFocus,
              "mt-5 inline-block rounded-full bg-foreground px-4 py-2 text-[0.875rem] font-medium text-background",
            )}
          >
            Browse all headlines
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-black/[0.06]">
          {articles.map((article, index) => (
            <li key={article.id}>
              <NewsRowCard
                article={article}
                onSelect={(item) => router.push(newsArticleHref(item.id))}
                className="rounded-none border-0 shadow-none"
                style={{ animationDelay: `${index * 40}ms` }}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
