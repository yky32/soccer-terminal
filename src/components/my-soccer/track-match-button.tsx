"use client";

import { Star } from "lucide-react";
import { useMySoccer } from "@/components/my-soccer/my-soccer-provider";
import { glassFocus, glassInset } from "@/components/glass-surface";
import { MAX_WATCHLIST } from "@/lib/match-monitor";
import { cn } from "@/lib/utils";

type TrackMatchButtonProps = {
  fixtureId: number;
  className?: string;
  compact?: boolean;
};

export function TrackMatchButton({ fixtureId, className, compact = false }: TrackMatchButtonProps) {
  const { isWatching, toggleMatch, atWatchlistCapacity, ready } = useMySoccer();
  const tracked = isWatching(fixtureId);
  const disabled = !tracked && atWatchlistCapacity;

  return (
    <button
      type="button"
      disabled={!ready || disabled}
      onClick={() => toggleMatch(fixtureId)}
      aria-pressed={tracked}
      title={
        disabled
          ? `Track list full (${MAX_WATCHLIST} matches)`
          : tracked
            ? "Stop tracking this match"
            : "Track this match in My Soccer"
      }
      className={cn(
        glassInset,
        glassFocus,
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        compact ? "px-2.5 py-1.5 text-[0.75rem]" : "px-3.5 py-2 text-[0.8125rem]",
        tracked
          ? "bg-foreground text-background"
          : "text-neutral-700 hover:bg-white/80 hover:text-neutral-950",
        className,
      )}
    >
      <Star
        className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")}
        strokeWidth={2}
        aria-hidden
        fill={tracked ? "currentColor" : "none"}
      />
      {tracked ? "Tracking" : "Track match"}
    </button>
  );
}
