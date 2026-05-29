import type { LiveMatch } from "@/lib/data/live-match";
import { getMatchPinColor } from "@/lib/football/match-pin-colors";

type MatchMapLegendProps = {
  matches: LiveMatch[];
};

export function MatchMapLegend({ matches }: MatchMapLegendProps) {
  const located = matches.filter(
    (match) => match.latitude !== null && match.longitude !== null,
  );

  if (located.length === 0) return null;

  return (
    <div className="pointer-events-none max-w-[14rem] rounded-md border border-neutral-200/80 bg-white/90 px-2.5 py-2 shadow-sm backdrop-blur-sm">
      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
        Map pins
      </p>
      <ul className="mt-1.5 space-y-1">
        {located.map((match, index) => {
          const color = getMatchPinColor(index);
          return (
            <li key={match.id} className="flex items-start gap-1.5">
              <span
                className="mt-0.5 h-2 w-2 shrink-0 rounded-full ring-1 ring-white"
                style={{ backgroundColor: color.hex }}
                aria-hidden
              />
              <span className="text-[9px] leading-tight text-neutral-700">
                <span className="font-semibold text-neutral-900">{match.homeTeam}</span>
                {" vs "}
                <span className="font-semibold text-neutral-900">{match.awayTeam}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
