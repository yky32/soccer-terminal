import type { MatchDetail } from "@/lib/data/match-detail";
import type { LiveMatch } from "@/lib/data/live-match";
import { MirrorMatchScoreline } from "@/components/matches/mirror-match-scoreline";
import { isMatchLiveStatus } from "@/lib/football/match-status";
import { cn } from "@/lib/utils";

export type TeamSideState = "leading" | "losing" | "draw" | "neutral";

function isUpcoming(match: LiveMatch) {
  return ["NS", "TBD"].includes(match.statusShort);
}

export function teamSideState(match: LiveMatch, side: "home" | "away"): TeamSideState {
  if (isUpcoming(match)) return "neutral";

  const winner = side === "home" ? match.homeWinner : match.awayWinner;
  if (winner === true) return "leading";
  if (winner === false) return "losing";

  if (match.homeGoals === match.awayGoals) return "draw";
  return side === "home"
    ? match.homeGoals > match.awayGoals
      ? "leading"
      : "losing"
    : match.awayGoals > match.homeGoals
      ? "leading"
      : "losing";
}

function kickoffLabel(kickoffAt: string | null) {
  if (!kickoffAt) return "Kickoff TBD";
  return new Date(kickoffAt).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadges(match: LiveMatch, detail: MatchDetail) {
  const badges: string[] = [];
  if (detail.score.extratime) badges.push("AET");
  if (!detail.score.penalty && badges.length === 0) {
    if (match.statusShort === "HT") badges.push("HT");
    else if (["FT", "AET", "PEN"].includes(match.statusShort)) badges.push("FT");
  }
  return badges;
}

function preShootoutScore(match: LiveMatch, detail: MatchDetail) {
  if (detail.score.extratime) return detail.score.extratime;
  if (detail.score.fulltime) return detail.score.fulltime;
  return { home: match.homeGoals, away: match.awayGoals };
}

function LiveStatusPill({ match }: { match: LiveMatch }) {
  const label =
    match.elapsed != null
      ? `${match.elapsed}'`
      : match.statusShort === "HT"
        ? "HT"
        : match.statusShort;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.75rem] font-semibold tabular-nums text-emerald-800 ring-1 ring-emerald-500/20">
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/50 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      {label}
    </span>
  );
}

function ScoreRow({
  home,
  away,
  prefix,
  className,
  dashClassName,
}: {
  home: number;
  away: number;
  prefix?: string;
  className?: string;
  dashClassName?: string;
}) {
  return (
    <p className={cn("flex items-center justify-center tabular-nums", className)}>
      {prefix ? <span className="mr-2 font-semibold">{prefix}</span> : null}
      <span className="inline-flex items-center gap-x-3 sm:gap-x-4">
        <span>{home}</span>
        <span className={cn("font-normal", dashClassName ?? "text-neutral-300")}>–</span>
        <span>{away}</span>
      </span>
    </p>
  );
}

export function MatchDetailScoreBlock({
  match,
  detail,
  className,
}: {
  match: LiveMatch;
  detail: MatchDetail;
  className?: string;
}) {
  const upcoming = isUpcoming(match);
  const live = isMatchLiveStatus(match.statusShort);
  const badges = statusBadges(match, detail);
  const penScore = detail.score.penalty;
  const mainScore = upcoming ? null : preShootoutScore(match, detail);
  const showFtSubline = Boolean(penScore && detail.score.extratime && detail.score.fulltime);
  const homeState = teamSideState(match, "home");
  const awayState = teamSideState(match, "away");

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <MirrorMatchScoreline
        variant="hero"
        homeTeam={match.homeTeam}
        awayTeam={match.awayTeam}
        homeLogo={match.homeLogo}
        awayLogo={match.awayLogo}
        homeGoals={mainScore?.home ?? 0}
        awayGoals={mainScore?.away ?? 0}
        upcoming={upcoming || !mainScore}
        homeState={homeState}
        awayState={awayState}
      />

      <div className="mt-2.5 flex flex-col items-center gap-1.5">
        {penScore ? (
          <ScoreRow
            home={penScore.home}
            away={penScore.away}
            prefix="Pens"
            className="text-[0.875rem] font-semibold text-neutral-700"
            dashClassName="text-neutral-400"
          />
        ) : null}

        {showFtSubline && detail.score.fulltime ? (
          <ScoreRow
            home={detail.score.fulltime.home}
            away={detail.score.fulltime.away}
            prefix="FT"
            className="text-[0.75rem] text-neutral-500"
            dashClassName="text-neutral-400"
          />
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {live ? <LiveStatusPill match={match} /> : null}
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full bg-neutral-100/90 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-neutral-600 ring-1 ring-black/[0.05]"
            >
              {badge}
            </span>
          ))}
          {!live ? (
            <span className="text-[0.8125rem] font-medium text-neutral-500">
              {upcoming ? kickoffLabel(match.kickoffAt) : match.statusLong}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
