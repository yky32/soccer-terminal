"use client";

import Link from "next/link";
import { Globe2 } from "lucide-react";
import { FootballLogo } from "@/components/overview/football-logo";
import { newsFocus, newsGlassSubtle } from "@/components/news/news-glass";
import { cn } from "@/lib/utils";

type NewsLeagueRailProps = {
  leagues: { name: string; count: number; logo: string | null }[];
  selectedLeague: string;
  onLeagueSelect: (league: string) => void;
  className?: string;
};

function leagueShortName(name: string) {
  const map: Record<string, string> = {
    "Premier League": "EPL",
    "La Liga": "La Liga",
    "Serie A": "Serie A",
    Bundesliga: "Bundesliga",
    "Ligue 1": "Ligue 1",
    "Champions League": "UCL",
    "Europa League": "UEL",
  };

  return map[name] ?? name.split(" ").slice(0, 2).join(" ");
}

export function NewsLeagueRail({
  leagues,
  selectedLeague,
  onLeagueSelect,
  className,
}: NewsLeagueRailProps) {
  const trending = leagues.slice(0, 8);

  return (
    <div className={cn("page-container py-1", className)}>
      <div
        className={cn(
          newsGlassSubtle,
          "flex items-center gap-1.5 rounded-lg px-1.5 py-1 sm:gap-2 sm:px-2",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <LeagueChip
            label="All"
            shortLabel="All"
            count={leagues.reduce((sum, league) => sum + league.count, 0)}
            active={selectedLeague === "all"}
            onClick={() => onLeagueSelect("all")}
          />
          {trending.map((league) => (
            <LeagueChip
              key={league.name}
              label={league.name}
              shortLabel={leagueShortName(league.name)}
              count={league.count}
              logo={league.logo}
              active={selectedLeague === league.name}
              onClick={() => onLeagueSelect(league.name)}
            />
          ))}
        </div>

        <Link
          href="/"
          className={cn(
            newsFocus,
            "inline-flex shrink-0 items-center gap-0.5 rounded-full border border-black/[0.06] bg-white/50 px-2 py-0.5 text-[0.6875rem] font-medium text-neutral-700 transition-colors hover:bg-white/80 hover:text-neutral-950",
          )}
        >
          <Globe2 className="h-3 w-3" aria-hidden />
          <span className="hidden sm:inline">Map</span>
        </Link>
      </div>
    </div>
  );
}

function LeagueChip({
  label,
  shortLabel,
  count,
  logo = null,
  active,
  onClick,
}: {
  label: string;
  shortLabel: string;
  count: number;
  logo?: string | null;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${label} · ${count}`}
      aria-label={`${label}, ${count} headlines`}
      aria-pressed={active}
      className={cn(
        newsFocus,
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[0.6875rem] font-medium transition-all active:scale-95 sm:px-2 sm:text-[0.75rem]",
        active
          ? "border-foreground bg-foreground text-background shadow-sm"
          : "border-transparent bg-white/40 text-neutral-700 hover:bg-white/70 hover:text-neutral-950",
      )}
    >
      {logo ? <FootballLogo src={logo} label={label} size="xs" /> : null}
      <span className="max-w-[4.5rem] truncate sm:max-w-none">{shortLabel}</span>
      <span
        className={cn(
          "rounded-full px-1 text-[0.5625rem] font-semibold tabular-nums sm:text-[0.625rem]",
          active ? "bg-background/15 text-background" : "bg-black/[0.05] text-neutral-500",
        )}
      >
        {count}
      </span>
    </button>
  );
}
