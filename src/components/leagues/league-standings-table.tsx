import { FootballLogo } from "@/components/overview/football-logo";
import type { LeagueFormResult, LeagueStandingRow } from "@/lib/data/league-profile";
import { cn } from "@/lib/utils";

type LeagueStandingsTableProps = {
  standings: LeagueStandingRow[];
};

export function LeagueStandingsTable({ standings }: LeagueStandingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] text-left text-[0.8125rem]">
        <thead>
          <tr className="border-b border-black/[0.06] text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            <th className="px-3 py-2.5 sm:px-4">#</th>
            <th className="px-2 py-2.5">Team</th>
            <th className="px-2 py-2.5 text-center">P</th>
            <th className="hidden px-2 py-2.5 text-center sm:table-cell">W</th>
            <th className="hidden px-2 py-2.5 text-center sm:table-cell">D</th>
            <th className="hidden px-2 py-2.5 text-center sm:table-cell">L</th>
            <th className="px-2 py-2.5 text-center">GD</th>
            <th className="px-2 py-2.5 text-center font-bold">Pts</th>
            <th className="hidden px-3 py-2.5 sm:px-4 md:table-cell">Form</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row) => {
            const gd = row.goalsFor - row.goalsAgainst;
            const isTopFour = row.rank <= 4;

            return (
              <tr
                key={`${row.rank}-${row.team}`}
                className={cn(
                  "border-b border-black/[0.04] transition-colors last:border-b-0",
                  isTopFour ? "bg-emerald-500/[0.05]" : "hover:bg-white/36",
                )}
              >
                <td className="px-3 py-2.5 font-semibold tabular-nums text-neutral-700 sm:px-4">
                  {row.rank}
                </td>
                <td className="px-2 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <FootballLogo src={row.teamLogo} label={row.team} size="sm" />
                    <span className="truncate font-semibold text-neutral-950">{row.team}</span>
                  </div>
                </td>
                <td className="px-2 py-2.5 text-center tabular-nums text-neutral-600">{row.played}</td>
                <td className="hidden px-2 py-2.5 text-center tabular-nums text-neutral-600 sm:table-cell">
                  {row.won}
                </td>
                <td className="hidden px-2 py-2.5 text-center tabular-nums text-neutral-600 sm:table-cell">
                  {row.drawn}
                </td>
                <td className="hidden px-2 py-2.5 text-center tabular-nums text-neutral-600 sm:table-cell">
                  {row.lost}
                </td>
                <td className="px-2 py-2.5 text-center tabular-nums font-medium text-neutral-800">
                  {gd > 0 ? `+${gd}` : gd}
                </td>
                <td className="px-2 py-2.5 text-center tabular-nums text-[0.875rem] font-bold text-neutral-950">
                  {row.points}
                </td>
                <td className="hidden px-3 py-2.5 sm:px-4 md:table-cell">
                  <FormStrip form={row.form} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FormStrip({ form }: { form: LeagueFormResult[] }) {
  return (
    <div className="flex items-center gap-1">
      {form.map((result, index) => (
        <span
          key={`${result}-${index}`}
          className={cn(
            "inline-flex h-5 w-5 items-center justify-center rounded text-[0.625rem] font-bold",
            result === "W" && "bg-emerald-500/15 text-emerald-800",
            result === "D" && "bg-neutral-500/10 text-neutral-600",
            result === "L" && "bg-rose-500/10 text-rose-700",
          )}
        >
          {result}
        </span>
      ))}
    </div>
  );
}
