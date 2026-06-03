"use client";

import { glassFocus, glassInset } from "@/components/glass-surface";
import { scrollToSection } from "@/lib/scroll-to-section";
import { cn } from "@/lib/utils";

export function GlobalSectionNav() {
  return (
    <nav
      className="sticky top-[4.25rem] z-40 border-b border-black/[0.06] bg-background/90 backdrop-blur-md md:hidden"
      aria-label="Global page sections"
    >
      <div className="page-container flex gap-1 py-2">
        <button
          type="button"
          onClick={() => scrollToSection("global-map")}
          className={cn(
            glassInset,
            glassFocus,
            "flex-1 rounded-full py-2 text-[0.8125rem] font-semibold text-neutral-700 transition-colors hover:text-neutral-950",
          )}
        >
          Map
        </button>
        <button
          type="button"
          onClick={() => scrollToSection("match-monitor")}
          className={cn(
            glassInset,
            glassFocus,
            "flex-1 rounded-full py-2 text-[0.8125rem] font-semibold text-neutral-700 transition-colors hover:text-neutral-950",
          )}
        >
          Monitor
        </button>
      </div>
    </nav>
  );
}
