import { FootballLogo } from "@/components/overview/football-logo";
import { LeagueIcon } from "@/components/leagues/league-icon";
import { MatchDetailScoreBlock } from "@/components/matches/match-detail-score";
import { leaguesGlassStrong } from "@/components/leagues/leagues-glass";
import type { MatchDetail } from "@/lib/data/match-detail";
import type { LiveMatch } from "@/lib/data/live-match";
import { cn } from "@/lib/utils";

function kickoffHeader(kickoffAt: string | null) {
  if (!kickoffAt) return null;
  return new Date(kickoffAt).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type MatchDetailHeroProps = {
  match: LiveMatch;
  detail: MatchDetail;
};

export function MatchDetailHero({ match, detail }: MatchDetailHeroProps) {
  const kickoff = kickoffHeader(match.kickoffAt);

  return (
    <div className={cn(leaguesGlassStrong, "overflow-hidden")}>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center justify-center gap-2 text-center sm:justify-start sm:text-left">
          <LeagueIcon league={{ logo: match.leagueLogo, name: match.league }} size="md" />
          <p className="text-[0.8125rem] font-semibold text-neutral-700">{match.league}</p>
          {match.leagueRound ? (
            <span className="text-[0.75rem] text-neutral-400">· {match.leagueRound}</span>
          ) : null}
        </div>

        {kickoff ? (
          <p className="mt-2 text-center text-[0.75rem] text-neutral-500 sm:text-left">{kickoff}</p>
        ) : null}

        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-4 sm:gap-x-6">
          <div className="flex items-center gap-3 sm:justify-end sm:text-right">
            <div className="min-w-0 sm:order-2">
              <p className="truncate text-[clamp(1rem,2.5vw,1.25rem)] font-semibold text-neutral-950">
                {match.homeTeam}
              </p>
            </div>
            <FootballLogo
              src={match.homeLogo}
              label={match.homeTeam}
              size="lg"
              className="rounded-full sm:order-1"
            />
          </div>

          <MatchDetailScoreBlock match={match} detail={detail} />

          <div className="flex items-center gap-3">
            <FootballLogo
              src={match.awayLogo}
              label={match.awayTeam}
              size="lg"
              className="rounded-full"
            />
            <div className="min-w-0">
              <p className="truncate text-[clamp(1rem,2.5vw,1.25rem)] font-semibold text-neutral-950">
                {match.awayTeam}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[0.75rem] text-neutral-500 sm:justify-center">
          {detail.referee ? <span>Referee: {detail.referee}</span> : null}
          {match.venue ? <span>{match.venue}</span> : null}
          {detail.timezone ? <span>{detail.timezone}</span> : null}
        </div>
      </div>
    </div>
  );
}
