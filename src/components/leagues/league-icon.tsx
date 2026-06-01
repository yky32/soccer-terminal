import { FootballLogo } from "@/components/overview/football-logo";
import type { LeagueProfile } from "@/lib/data/league-profile";
import { getCatalogEntryByLeagueName } from "@/lib/football/league-catalog";
import { cn } from "@/lib/utils";

type LeagueIconProps = {
  league: Pick<LeagueProfile, "logo" | "name">;
  size?: "xs" | "sm" | "md";
  className?: string;
};

/** Competition crest — same source as leagues feed chips. */
export function LeagueIcon({ league, size = "xs", className }: LeagueIconProps) {
  const logo = league.logo ?? getCatalogEntryByLeagueName(league.name)?.logo ?? null;

  return (
    <FootballLogo
      src={logo}
      label={league.name}
      size={size}
      className={cn("shrink-0", className)}
    />
  );
}
