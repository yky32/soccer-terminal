import { FootballLogo } from "@/components/overview/football-logo";
import { LineupPlayerLink } from "@/components/matches/lineup-player-link";
import { MatchLineupPitch } from "@/components/matches/match-lineup-pitch";
import { MatchDetailSectionTitle } from "@/components/matches/match-detail-section-title";
import {
  groupByLineupPosition,
  LineupPositionRowHeader,
} from "@/components/matches/lineup-position-style";
import {
  LineupBenchStatRow,
  LineupCoachPin,
  LineupPlayerName,
  LineupSubInIndicator,
  PlayerKitNumber,
} from "@/components/matches/lineup-player-indicators";
import { PlayerAvatar } from "@/components/players/player-avatar";
import { leaguesGlass, leaguesGlassInset } from "@/components/leagues/leagues-glass";
import type {
  MatchDetailLineupSide,
  MatchDetailPlayer,
  MatchDetailTimelineView,
} from "@/lib/data/match-detail";
import {
  buildLineupTeamHighlights,
  lineupPlayerTooltip,
  resolvePlayerHighlight,
  type LineupTeamHighlights,
} from "@/lib/football/lineup-player-highlights";
import { shortPlayerName } from "@/lib/football/lineup-pitch-layout";
import { cn } from "@/lib/utils";
import { ArrowLeftRight, LayoutGrid } from "lucide-react";

function substitutePlayed(player: MatchDetailPlayer) {
  if (player.minutes != null && player.minutes > 0) return true;
  return Boolean(player.rating?.trim());
}

function SubstituteChip({
  player,
  highlights,
  catalogLeagueId,
  teamName,
  returnTo,
}: {
  player: MatchDetailPlayer;
  highlights: LineupTeamHighlights;
  catalogLeagueId: string | null;
  teamName: string;
  returnTo: string;
}) {
  const played = substitutePlayed(player);
  const highlight = resolvePlayerHighlight(player, highlights);

  const chip = (
    <div
      className={cn(
        leaguesGlassInset,
        "flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 transition-colors",
        played && "bg-black/[0.05] ring-1 ring-emerald-500/15",
        highlight.topRating && played && "ring-amber-400/40",
        highlight.worstRating && played && "ring-rose-400/40",
      )}
      title={lineupPlayerTooltip(player, highlight)}
    >
      <PlayerAvatar
        src={player.photo}
        name={player.name}
        size="sm"
        className={cn(
          "!h-8 !w-8",
          highlight.topRating && "ring-2 ring-amber-400/80",
          highlight.worstRating && "ring-2 ring-rose-400/80",
        )}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <LineupPlayerName
            name={shortPlayerName(player.name)}
            captain={player.captain}
            className="min-w-0 flex-1"
            nameClassName="text-[0.75rem] font-semibold leading-tight text-neutral-900"
          />
          {player.rating ? (
            <span
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-[0.6875rem] font-bold tabular-nums",
                highlight.topRating
                  ? "bg-amber-100 text-amber-950 ring-1 ring-amber-400/40"
                  : highlight.worstRating
                    ? "bg-rose-100 text-rose-950 ring-1 ring-rose-400/40"
                    : "bg-neutral-100 text-neutral-800",
              )}
            >
              {player.rating}
            </span>
          ) : null}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {player.number ? <PlayerKitNumber number={player.number} /> : null}
          <LineupBenchStatRow player={player} />
          {played ? <LineupSubInIndicator minutes={player.minutes} /> : null}
        </div>
      </div>
    </div>
  );

  return (
    <LineupPlayerLink
      catalogLeagueId={catalogLeagueId}
      teamName={teamName}
      playerName={player.name}
      returnTo={returnTo}
      className="h-full"
    >
      {chip}
    </LineupPlayerLink>
  );
}

function SubstitutesBench({
  players,
  highlights,
  catalogLeagueId,
  teamName,
  returnTo,
}: {
  players: MatchDetailPlayer[];
  highlights: LineupTeamHighlights;
  catalogLeagueId: string | null;
  teamName: string;
  returnTo: string;
}) {
  if (players.length === 0) return null;

  const groups = groupByLineupPosition(players);

  return (
    <div className="mt-3 border-t border-black/[0.06] pt-3">
      <MatchDetailSectionTitle icon={ArrowLeftRight} as="p" size="sm">
        Substitutes
      </MatchDetailSectionTitle>
      <div className="mt-3 space-y-3">
        {groups.map((group) => (
          <div key={group.kind}>
            <LineupPositionRowHeader kind={group.kind} className="mb-1.5" />
            <div className="grid grid-cols-2 gap-2">
              {group.players.map((player, index) => (
                <SubstituteChip
                  key={`${group.kind}-${player.id ?? player.name}-${player.number ?? index}`}
                  player={player}
                  highlights={highlights}
                  catalogLeagueId={catalogLeagueId}
                  teamName={teamName}
                  returnTo={returnTo}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamFormationColumn({
  lineup,
  side,
  timeline,
  catalogLeagueId,
  returnTo,
}: {
  lineup: MatchDetailLineupSide;
  side: "home" | "away";
  timeline: MatchDetailTimelineView;
  catalogLeagueId: string | null;
  returnTo: string;
}) {
  const squad = [...lineup.starting, ...lineup.substitutes];
  const highlights = buildLineupTeamHighlights(squad, timeline, side);

  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-center gap-2">
        <FootballLogo src={lineup.teamLogo} label={lineup.team} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.8125rem] font-semibold leading-tight text-neutral-950">
            {lineup.team}
          </p>
          <p className="text-[0.75rem] leading-tight text-neutral-500">
            {lineup.formation ?? "—"}
          </p>
        </div>
        {lineup.coach || lineup.coachPhoto ? (
          <LineupCoachPin
            name={lineup.coach ?? "Coach"}
            photo={lineup.coachPhoto}
          />
        ) : null}
      </div>

      <div className="mt-3 flex justify-center px-0.5 py-2 sm:px-1">
        <MatchLineupPitch
          players={lineup.starting}
          side={side}
          formation={lineup.formation}
          highlights={highlights}
          catalogLeagueId={catalogLeagueId}
          teamName={lineup.team}
          returnTo={returnTo}
          className="w-full"
        />
      </div>

      <SubstitutesBench
        players={lineup.substitutes}
        highlights={highlights}
        catalogLeagueId={catalogLeagueId}
        teamName={lineup.team}
        returnTo={returnTo}
      />
    </div>
  );
}

export function MatchDetailLineups({
  lineups,
  timeline,
  catalogLeagueId,
  returnTo,
}: {
  lineups: {
    home: MatchDetailLineupSide | null;
    away: MatchDetailLineupSide | null;
  };
  timeline: MatchDetailTimelineView;
  catalogLeagueId: string | null;
  returnTo: string;
}) {
  return (
    <section className={cn(leaguesGlass, "overflow-hidden")} aria-label="Formation">
      <div className="space-y-4 p-5 sm:p-6">
        <MatchDetailSectionTitle icon={LayoutGrid}>Formation</MatchDetailSectionTitle>

        {!lineups.home && !lineups.away ? (
          <p className="py-6 text-center text-[0.875rem] text-neutral-500">
            Lineups are not published yet.
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-0">
            {lineups.home ? (
              <div
                className={cn(
                  "min-w-0",
                  lineups.away && "lg:pr-5 lg:border-r lg:border-black/[0.06]",
                )}
              >
                <TeamFormationColumn
                  lineup={lineups.home}
                  side="home"
                  timeline={timeline}
                  catalogLeagueId={catalogLeagueId}
                  returnTo={returnTo}
                />
              </div>
            ) : null}

            {lineups.away ? (
              <div className={cn("min-w-0", lineups.home && "lg:pl-5")}>
                <TeamFormationColumn
                  lineup={lineups.away}
                  side="away"
                  timeline={timeline}
                  catalogLeagueId={catalogLeagueId}
                  returnTo={returnTo}
                />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
