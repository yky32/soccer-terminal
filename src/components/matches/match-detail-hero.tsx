"use client";

import { LeagueIcon } from "@/components/leagues/league-icon";
import { MatchDetailScoreBlock } from "@/components/matches/match-detail-score";
import { TrackMatchButton } from "@/components/my-soccer/track-match-button";
import {
  leaguesGlassInset,
  leaguesGlassInsetBar,
  leaguesGlassStrong,
} from "@/components/leagues/leagues-glass";
import type { MatchDetail } from "@/lib/data/match-detail";
import type { LiveMatch } from "@/lib/data/live-match";
import { useFormatDateTime } from "@/lib/use-format-date-time";
import { cn } from "@/lib/utils";

function isUpcoming(match: LiveMatch) {
  return ["NS", "TBD"].includes(match.statusShort);
}

type MatchDetailHeroProps = {
  match: LiveMatch;
  detail: MatchDetail;
};

export function MatchDetailHero({ match, detail }: MatchDetailHeroProps) {
  const { formatKickoffFull } = useFormatDateTime();
  const kickoff = match.kickoffAt ? formatKickoffFull(match.kickoffAt) : null;
  const upcoming = isUpcoming(match);

  const metaItems = [
    detail.referee ? `Referee · ${detail.referee}` : null,
    match.venue,
    detail.timezone,
  ].filter(Boolean);

  return (
    <div className={cn(leaguesGlassStrong, "overflow-hidden")}>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center justify-center gap-2 text-center sm:justify-start sm:text-left">
          <LeagueIcon league={{ logo: match.leagueLogo, name: match.league }} size="md" />
          <p className="text-[0.8125rem] font-semibold text-neutral-700">{match.league}</p>
          {match.leagueRound ? (
            <span
              className={cn(
                leaguesGlassInset,
                "rounded-full px-2 py-0.5 text-[0.6875rem] font-medium text-neutral-500",
              )}
            >
              {match.leagueRound}
            </span>
          ) : null}
          <TrackMatchButton fixtureId={match.id} compact className="ml-auto sm:ml-0" />
        </div>

        {kickoff && !upcoming ? (
          <p className="mt-1.5 text-center text-[0.75rem] text-neutral-500 sm:text-left">
            {kickoff}
          </p>
        ) : null}

        <MatchDetailScoreBlock match={match} detail={detail} className="mt-5 w-full" />
      </div>

      {metaItems.length > 0 ? (
        <div
          className={cn(
            leaguesGlassInsetBar,
            "border-t border-black/[0.06] px-5 py-3 text-center text-[0.75rem] text-neutral-500 sm:px-6",
          )}
        >
          {metaItems.join(" · ")}
        </div>
      ) : null}
    </div>
  );
}
