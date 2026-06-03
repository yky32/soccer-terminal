import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { leaguesGlassFocus } from "@/components/leagues/leagues-glass";
import { appendReturnTo } from "@/lib/return-navigation";
import { playerHrefFromTeamAndName } from "@/lib/player-paths";
import { cn } from "@/lib/utils";

type LineupPlayerLinkProps = {
  catalogLeagueId: string | null;
  teamName: string;
  playerName: string;
  returnTo: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function LineupPlayerLink({
  catalogLeagueId,
  teamName,
  playerName,
  returnTo,
  className,
  style,
  children,
}: LineupPlayerLinkProps) {
  if (!catalogLeagueId?.trim()) {
    return <>{children}</>;
  }

  const href = appendReturnTo(
    playerHrefFromTeamAndName(catalogLeagueId, teamName, playerName),
    returnTo,
  );

  return (
    <Link
      href={href}
      prefetch
      style={style}
      className={cn(
        leaguesGlassFocus,
        "block rounded-xl transition-[opacity,transform] hover:opacity-95 active:scale-[0.99]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
