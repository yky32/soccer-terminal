"use client";

import { useState } from "react";
import { LeagueFixturesList } from "@/components/leagues/league-fixtures-list";
import { LeagueStandingsTable } from "@/components/leagues/league-standings-table";
import { LeagueStatLeaderGrid } from "@/components/leagues/league-stat-leaders";
import {
  leaguesGlass,
  leaguesGlassInsetBar,
} from "@/components/leagues/leagues-glass";
import { TeamFormStrip, TeamHero, TeamUpcomingStrip } from "@/components/teams/team-hero";
import { TeamNewsPanel } from "@/components/teams/team-news-panel";
import { TeamResultsList } from "@/components/teams/team-results-list";
import { TeamSquadList } from "@/components/teams/team-squad-list";
import type { TeamProfile } from "@/lib/data/team-profile";
import type { NewsArticle } from "@/lib/data/news-article";
import { ENABLE_NEWS } from "@/lib/feature-flags";
import { cn } from "@/lib/utils";

type TeamDetailTab =
  | "overview"
  | "table"
  | "fixtures"
  | "squad"
  | "players"
  | "team"
  | "history"
  | "news";

type TeamDetailPanelProps = {
  team: TeamProfile;
  articles: NewsArticle[];
  teamNews: NewsArticle[];
};

const ALL_TABS: { id: TeamDetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "table", label: "Table" },
  { id: "fixtures", label: "Fixtures" },
  { id: "squad", label: "Squad" },
  { id: "players", label: "Players" },
  { id: "team", label: "Team" },
  { id: "history", label: "History" },
  { id: "news", label: "News" },
];

const TABS = ALL_TABS.filter((tab) => ENABLE_NEWS || tab.id !== "news");

export function TeamDetailPanel({ team, articles, teamNews }: TeamDetailPanelProps) {
  const [tab, setTab] = useState<TeamDetailTab>("overview");

  return (
    <div className="space-y-4">
      <TeamHero team={team} />

      <div
        className={cn(
          leaguesGlass,
          "flex gap-1 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
        role="tablist"
        aria-label={`${team.name} sections`}
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-[0.8125rem] font-medium transition-colors sm:px-4",
              tab === item.id
                ? "bg-foreground text-background"
                : "text-neutral-700 hover:bg-white/50 hover:text-neutral-950",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="space-y-4">
          <section className={cn(leaguesGlass, "overflow-hidden")}>
            <SectionHeader title="Team form" meta={team.league.season} />
            <div className="grid gap-px bg-black/[0.06] lg:grid-cols-2">
              <div className="bg-white/20 px-4 py-4 sm:px-5">
                <h3 className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                  Last 5 matches
                </h3>
                <TeamFormStrip team={team} />
              </div>
              <div className="bg-white/20 px-4 py-4 sm:px-5 lg:border-l lg:border-black/[0.06]">
                <h3 className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                  Next 5 matches
                </h3>
                <TeamUpcomingStrip team={team} />
              </div>
            </div>
          </section>

          <LeagueStatLeaderGrid
            title="Squad leaders"
            subtitle={`${team.league.shortName} · ${team.league.season}`}
            boards={team.leaderBoards}
            focusTeam={team.name}
            leagueId={team.league.id}
          />

          <section className={cn(leaguesGlass, "overflow-hidden")}>
            <SectionHeader title="Recent results" meta={`${team.recentResults.length} matches`} />
            <TeamResultsList results={team.recentResults} teamName={team.name} />
          </section>

          <ClubSnapshot team={team} />
        </div>
      ) : null}

      {tab === "table" ? (
        <section className={cn(leaguesGlass, "overflow-hidden")}>
          <SectionHeader title="Table" meta={`Matchday ${team.league.matchday}`} />
          <LeagueStandingsTable
            standings={team.league.standings}
            leagueId={team.league.id}
            highlightTeam={team.name}
          />
        </section>
      ) : null}

      {tab === "fixtures" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className={cn(leaguesGlass, "overflow-hidden")}>
            <SectionHeader title="Recent results" meta={`${team.recentResults.length} matches`} />
            <TeamResultsList results={team.recentResults} teamName={team.name} />
          </section>
          <section className={cn(leaguesGlass, "overflow-hidden")}>
            <SectionHeader title="Upcoming" meta={`${team.upcomingFixtures.length} fixtures`} />
            <LeagueFixturesList fixtures={team.upcomingFixtures} />
          </section>
        </div>
      ) : null}

      {tab === "squad" ? (
        <section className={cn(leaguesGlass, "overflow-hidden")}>
          <SectionHeader title="Squad" meta={`${team.squad.length} players`} />
          <TeamSquadList squad={team.squad} leagueId={team.league.id} />
        </section>
      ) : null}

      {tab === "players" ? (
        <LeagueStatLeaderGrid
          title="Player stats"
          subtitle={`${team.name} · ${team.league.season}`}
          boards={team.leaderBoards}
          focusTeam={team.name}
          leagueId={team.league.id}
        />
      ) : null}

      {tab === "team" ? <ClubDetails team={team} /> : null}

      {tab === "history" ? (
        <section className={cn(leaguesGlass, "overflow-hidden")}>
          <SectionHeader title="History" meta={`${team.history.length} seasons`} />
          <ul className="divide-y divide-black/[0.06]">
            {team.history.map((season) => (
              <li
                key={season.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5"
              >
                <div>
                  <p className="text-[0.9375rem] font-semibold text-neutral-950">{season.season}</p>
                  <p className="mt-0.5 text-[0.8125rem] text-neutral-600">
                    {season.won}W · {season.drawn}D · {season.lost}L
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                    Finish
                  </p>
                  <p className="mt-0.5 text-[0.9375rem] font-bold tabular-nums text-neutral-950">
                    {season.finish}
                    {ordinalSuffix(season.finish)}
                  </p>
                  <p className="text-[0.75rem] tabular-nums text-neutral-500">{season.points} pts</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {ENABLE_NEWS && tab === "news" ? (
        <TeamNewsPanel team={team} articles={teamNews.length > 0 ? teamNews : articles.slice(0, 6)} />
      ) : null}
    </div>
  );
}

function SectionHeader({ title, meta }: { title: string; meta: string }) {
  return (
    <header
      className={cn(
        leaguesGlassInsetBar,
        "flex items-center justify-between border-b border-black/[0.06] px-4 py-3 sm:px-5",
      )}
    >
      <h2 className="text-[clamp(1.125rem,2.2vw,1.375rem)] font-semibold tracking-[-0.03em] text-neutral-950">
        {title}
      </h2>
      <span className="text-[0.8125rem] text-neutral-500">{meta}</span>
    </header>
  );
}

function ClubSnapshot({ team }: { team: TeamProfile }) {
  return (
    <section className={cn(leaguesGlass, "overflow-hidden")}>
      <SectionHeader title="Club" meta={team.club.stadium} />
      <div className="grid gap-px bg-black/[0.06] sm:grid-cols-3">
        <InfoTile label="Stadium" value={team.club.stadium} />
        <InfoTile label="Capacity" value={team.club.capacity.toLocaleString()} />
        <InfoTile label="Founded" value={String(team.club.founded)} />
      </div>
    </section>
  );
}

function ClubDetails({ team }: { team: TeamProfile }) {
  return (
    <div className="space-y-4">
      <section className={cn(leaguesGlass, "overflow-hidden")}>
        <SectionHeader title="Club info" meta={team.club.city} />
        <div className="grid gap-px bg-black/[0.06] sm:grid-cols-2 lg:grid-cols-3">
          <InfoTile label="Stadium" value={team.club.stadium} />
          <InfoTile label="Capacity" value={team.club.capacity.toLocaleString()} />
          <InfoTile label="Opened" value={String(team.club.opened)} />
          <InfoTile label="Surface" value={team.club.surface} />
          <InfoTile label="Founded" value={String(team.club.founded)} />
          <InfoTile label="Country" value={team.club.country} />
        </div>
      </section>

      <section className={cn(leaguesGlass, "overflow-hidden")}>
        <SectionHeader
          title="Coach"
          meta={`${team.coach.matches} matches this season`}
        />
        <div className="grid gap-px bg-black/[0.06] sm:grid-cols-3">
          <InfoTile label="Manager" value={team.coach.name} />
          <InfoTile label="Win rate" value={`${team.coach.winRate}%`} />
          <InfoTile label="Points per game" value={team.coach.pointsPerGame.toFixed(2)} />
        </div>
      </section>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/20 px-4 py-4 sm:px-5">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 text-[0.9375rem] font-semibold text-neutral-950">{value}</p>
    </div>
  );
}

function ordinalSuffix(value: number) {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  switch (value % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
