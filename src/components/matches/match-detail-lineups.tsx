import { FootballLogo } from "@/components/overview/football-logo";
import { leaguesGlass } from "@/components/leagues/leagues-glass";
import type { MatchDetailLineupSide, MatchDetailPlayer } from "@/lib/data/match-detail";
import { cn } from "@/lib/utils";

function PlayerList({
  title,
  players,
}: {
  title: string;
  players: MatchDetailPlayer[];
}) {
  if (players.length === 0) return null;

  return (
    <div>
      <p className="text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-neutral-500">
        {title}
      </p>
      <ul className="mt-2 space-y-1">
        {players.map((player, index) => (
          <li
            key={`${title}-${player.id ?? player.name}-${index}`}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[0.8125rem]"
          >
            <span className="w-5 shrink-0 text-center text-[0.6875rem] font-bold tabular-nums text-neutral-400">
              {player.number ?? "–"}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium text-neutral-900">
              {player.name}
            </span>
            {player.rating ? (
              <span className="shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-[0.6875rem] font-bold tabular-nums text-neutral-800">
                {player.rating}
              </span>
            ) : null}
            {player.position ? (
              <span className="shrink-0 text-[0.6875rem] font-semibold text-neutral-400">
                {player.position}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LineupCard({ lineup }: { lineup: MatchDetailLineupSide }) {
  return (
    <section className={cn(leaguesGlass, "overflow-hidden p-4 sm:p-5")}>
      <div className="flex items-center gap-2">
        <FootballLogo src={lineup.teamLogo} label={lineup.team} size="sm" />
        <div className="min-w-0">
          <h3 className="truncate text-[0.9375rem] font-semibold text-neutral-950">
            {lineup.team}
          </h3>
          <p className="text-[0.75rem] text-neutral-500">
            {[lineup.formation, lineup.coach].filter(Boolean).join(" · ") || "Lineup pending"}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <PlayerList title="Starting XI" players={lineup.starting} />
        <PlayerList title="Substitutes" players={lineup.substitutes} />
      </div>
    </section>
  );
}

export function MatchDetailLineups({
  lineups,
}: {
  lineups: {
    home: MatchDetailLineupSide | null;
    away: MatchDetailLineupSide | null;
  };
}) {
  if (!lineups.home && !lineups.away) {
    return (
      <div className={cn(leaguesGlass, "px-4 py-10 text-center")}>
        <p className="text-[0.875rem] text-neutral-500">Lineups are not published yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {lineups.home ? <LineupCard lineup={lineups.home} /> : null}
      {lineups.away ? <LineupCard lineup={lineups.away} /> : null}
    </div>
  );
}
