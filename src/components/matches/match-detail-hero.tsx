import { FootballLogo } from "@/components/overview/football-logo";
import { LeagueIcon } from "@/components/leagues/league-icon";
import {
  MatchDetailScoreBlock,
  teamSideState,
  type TeamSideState,
} from "@/components/matches/match-detail-score";
import {
  leaguesGlassInset,
  leaguesGlassInsetBar,
  leaguesGlassStrong,
} from "@/components/leagues/leagues-glass";
import type { MatchDetail } from "@/lib/data/match-detail";
import type { LiveMatch } from "@/lib/data/live-match";
import { cn } from "@/lib/utils";

function isUpcoming(match: LiveMatch) {
  return ["NS", "TBD"].includes(match.statusShort);
}

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

function teamNameClass(state: TeamSideState) {
  return cn(
    "truncate text-[clamp(1rem,2.5vw,1.25rem)] leading-tight",
    state === "leading" && "font-semibold text-neutral-950",
    state === "losing" && "font-medium text-neutral-400",
    state === "draw" && "font-semibold text-neutral-950",
    state === "neutral" && "font-semibold text-neutral-950",
  );
}

function teamLogoClass(state: TeamSideState) {
  return cn(
    "!h-10 !w-10 rounded-full ring-1 sm:!h-11 sm:!w-11",
    state === "leading" && "ring-emerald-300/70",
    state === "losing" && "opacity-80 ring-black/[0.06]",
    (state === "draw" || state === "neutral") && "ring-black/[0.08]",
  );
}

type MatchDetailHeroProps = {
  match: LiveMatch;
  detail: MatchDetail;
};

export function MatchDetailHero({ match, detail }: MatchDetailHeroProps) {
  const kickoff = kickoffHeader(match.kickoffAt);
  const upcoming = isUpcoming(match);
  const homeState = teamSideState(match, "home");
  const awayState = teamSideState(match, "away");

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
        </div>

        {kickoff && !upcoming ? (
          <p className="mt-1.5 text-center text-[0.75rem] text-neutral-500 sm:text-left">
            {kickoff}
          </p>
        ) : null}

        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-4 sm:gap-x-6">
          <div className="flex items-center gap-3 sm:justify-end sm:text-right">
            <div className="min-w-0 sm:order-2">
              <p className={teamNameClass(homeState)}>{match.homeTeam}</p>
            </div>
            <FootballLogo
              src={match.homeLogo}
              label={match.homeTeam}
              size="lg"
              className={cn(teamLogoClass(homeState), "sm:order-1")}
            />
          </div>

          <MatchDetailScoreBlock match={match} detail={detail} />

          <div className="flex items-center gap-3">
            <FootballLogo
              src={match.awayLogo}
              label={match.awayTeam}
              size="lg"
              className={teamLogoClass(awayState)}
            />
            <div className="min-w-0">
              <p className={teamNameClass(awayState)}>{match.awayTeam}</p>
            </div>
          </div>
        </div>
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
