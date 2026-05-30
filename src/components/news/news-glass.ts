import { cn } from "@/lib/utils";

/** Liquid glass brick — translucent, specular, heavy blur (see globals.css) */
export const newsGlass = "news-glass-brick rounded-[1.25rem]";

export const newsGlassStrong = "news-glass-brick news-glass-brick--strong rounded-[1.25rem]";

export const newsGlassSubtle = "news-glass-brick news-glass-brick--subtle rounded-xl";

export const newsGlassInset = "news-glass-brick news-glass-brick--inset rounded-xl";

export const newsGlassHover =
  "news-glass-brick--interactive transition-[transform,box-shadow,border-color] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]";

export const newsEnter =
  "news-enter motion-reduce:animate-none motion-reduce:opacity-100";

export const newsDrawerEnter =
  "news-drawer-enter motion-reduce:animate-none motion-reduce:opacity-100";

export const newsFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

export function newsGlassPanel(className?: string, strong = false) {
  return cn(strong ? newsGlassStrong : newsGlass, className);
}
