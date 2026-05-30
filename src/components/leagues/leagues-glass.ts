import { cn } from "@/lib/utils";

/** Leagues page glass — ~20% more opacity than the shared liquid glass tokens. */
export const leaguesGlass = "leagues-glass-brick rounded-[1.25rem]";

export const leaguesGlassStrong =
  "leagues-glass-brick leagues-glass-brick--strong rounded-[1.25rem]";

export const leaguesGlassSticky = "leagues-glass-brick leagues-glass-brick--sticky";

export const leaguesGlassSubtle = "leagues-glass-brick leagues-glass-brick--subtle rounded-xl";

export const leaguesGlassInset = "leagues-glass-brick leagues-glass-brick--inset rounded-xl";

export const leaguesGlassInsetBar = "leagues-glass-inset";

export const leaguesGlassHover =
  "leagues-glass-brick--interactive transition-[transform,box-shadow,border-color] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]";

export const leaguesGlassEnter = "news-enter motion-reduce:animate-none motion-reduce:opacity-100";

export const leaguesGlassFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

export function leaguesGlassPanel(className?: string, strong = false) {
  return cn(strong ? leaguesGlassStrong : leaguesGlass, className);
}
