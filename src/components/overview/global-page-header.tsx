"use client";

import { Globe2, MonitorDot, type LucideIcon } from "lucide-react";
import { glassInset, glassHover, glassFocus } from "@/components/glass-surface";
import { cn } from "@/lib/utils";

const HEADER_OFFSET = 72;

function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;

  const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

function JumpIconButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        glassInset,
        glassHover,
        glassFocus,
        "flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 transition-colors hover:text-neutral-950",
      )}
    >
      <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} aria-hidden />
    </button>
  );
}

export function GlobalPageHeader() {
  return (
    <header className="page-container pt-10 pb-8 sm:pt-12 sm:pb-10">
      <div className="flex items-start justify-between gap-5 sm:gap-8">
        <div className="min-w-0 flex-1">
          <h1 className="text-title max-w-4xl font-semibold text-neutral-950">
            Monitor football everywhere.
          </h1>
          <p className="text-body-large mt-7 max-w-3xl text-neutral-700 sm:mt-8">
            Live and upcoming matches on a global map — with news, league coverage, and AI
            insights when you need them.
          </p>
        </div>

        <div
          className={cn(glassInset, "flex shrink-0 items-center gap-1 rounded-full p-1")}
          role="group"
          aria-label="Jump to section"
        >
          <JumpIconButton
            icon={Globe2}
            label="Jump to map"
            onClick={() => scrollToSection("global-map")}
          />
          <JumpIconButton
            icon={MonitorDot}
            label="Jump to match monitor"
            onClick={() => scrollToSection("match-monitor")}
          />
        </div>
      </div>
    </header>
  );
}
