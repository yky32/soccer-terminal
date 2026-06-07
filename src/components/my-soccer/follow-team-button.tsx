"use client";

import { Star } from "lucide-react";
import { useMySoccer } from "@/components/my-soccer/my-soccer-provider";
import { glassFocus, glassInset } from "@/components/glass-surface";
import { MAX_FAVORITE_TEAMS } from "@/lib/my-soccer";
import type { FavoriteTeam } from "@/lib/my-soccer";
import { cn } from "@/lib/utils";

type FollowTeamButtonProps = {
  team: FavoriteTeam;
  className?: string;
  compact?: boolean;
};

export function FollowTeamButton({ team, className, compact = false }: FollowTeamButtonProps) {
  const { isFollowing, toggleFavorite, atFavoritesCapacity, ready } = useMySoccer();
  const following = isFollowing(team.leagueId, team.teamSlug);
  const disabled = !following && atFavoritesCapacity;

  return (
    <button
      type="button"
      disabled={!ready || disabled}
      onClick={() => toggleFavorite(team)}
      aria-pressed={following}
      title={
        disabled
          ? `Follow list full (${MAX_FAVORITE_TEAMS} teams)`
          : following
            ? "Unfollow this team"
            : "Follow this team in My Soccer"
      }
      className={cn(
        glassInset,
        glassFocus,
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        compact ? "px-2.5 py-1.5 text-[0.75rem]" : "px-3.5 py-2 text-[0.8125rem]",
        following
          ? "bg-foreground text-background"
          : "text-neutral-700 hover:bg-white/80 hover:text-neutral-950",
        className,
      )}
    >
      <Star
        className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")}
        strokeWidth={2}
        aria-hidden
        fill={following ? "currentColor" : "none"}
      />
      {following ? "Following" : "Follow team"}
    </button>
  );
}
