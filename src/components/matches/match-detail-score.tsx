import type { MatchDetail } from "@/lib/data/match-detail";
import type { LiveMatch } from "@/lib/data/live-match";
import { cn } from "@/lib/utils";

function isUpcoming(match: LiveMatch) {
  return ["NS", "TBD"].includes(match.statusShort);
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
  if (detail.score.penalty) badges.push("Pens");
  if (badges.length > 0) return badges;
  if (match.statusShort === "HT") return ["HT"];
  if (["FT", "AET", "PEN"].includes(match.statusShort)) return ["FT"];
  return [];
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
  const badges = statusBadges(match, detail);
  const displayScore = upcoming
    ? null
    : (detail.score.penalty && detail.score.fulltime) ||
      detail.score.extratime ||
      detail.score.fulltime ||
      { home: match.homeGoals, away: match.awayGoals };

  return (
    <div className={cn("text-center", className)}>
      {upcoming ? (
        <p className="text-[1.75rem] font-bold tracking-tight text-sky-800">vs</p>
      ) : displayScore ? (
        <p className="text-[clamp(2rem,5vw,2.75rem)] font-bold tabular-nums tracking-tight text-neutral-950">
          {displayScore.home}
          <span className="text-neutral-300">–</span>
          {displayScore.away}
        </p>
      ) : (
        <p className="text-[1.75rem] font-bold tracking-tight text-neutral-400">vs</p>
      )}

      {detail.score.penalty ? (
        <p className="mt-1 text-[0.875rem] font-semibold tabular-nums text-neutral-700">
          Pens {detail.score.penalty.home}
          <span className="text-neutral-300">–</span>
          {detail.score.penalty.away}
        </p>
      ) : null}

      {detail.score.extratime && detail.score.fulltime ? (
        <p className="mt-0.5 text-[0.75rem] tabular-nums text-neutral-500">
          FT {detail.score.fulltime.home}–{detail.score.fulltime.away}
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
        {badges.map((badge) => (
          <span
            key={badge}
            className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-neutral-600"
          >
            {badge}
          </span>
        ))}
        <span className="text-[0.8125rem] font-medium text-neutral-500">
          {upcoming ? kickoffLabel(match.kickoffAt) : match.statusLong}
        </span>
      </div>
    </div>
  );
}
