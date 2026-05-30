import { cn } from "@/lib/utils";

/** Liquid glass — translucent panels with backdrop blur (see globals.css `.news-glass-brick`). */
export const glass = "news-glass-brick rounded-[1.25rem]";

export const glassStrong = "news-glass-brick news-glass-brick--strong rounded-[1.25rem]";

export const glassSticky = "news-glass-brick news-glass-brick--sticky";

export const glassSubtle = "news-glass-brick news-glass-brick--subtle rounded-xl";

export const glassInset = "news-glass-brick news-glass-brick--inset rounded-xl";

export const glassHover =
  "news-glass-brick--interactive transition-[transform,box-shadow,border-color] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]";

export const glassEnter = "news-enter motion-reduce:animate-none motion-reduce:opacity-100";

export const glassFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

export function glassPanel(className?: string, strong = false) {
  return cn(strong ? glassStrong : glass, className);
}
