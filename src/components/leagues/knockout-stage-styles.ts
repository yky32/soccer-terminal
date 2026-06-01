import { Medal, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export type KnockoutStage = "default" | "bronze" | "final";

export const KNOCKOUT_STAGE_META: Record<
  Exclude<KnockoutStage, "default">,
  { label: string; Icon: typeof Trophy; headerClass: string; badgeClass: string }
> = {
  bronze: {
    label: "Bronze final",
    Icon: Medal,
    headerClass: "text-orange-900",
    badgeClass: "bg-orange-500/15 text-orange-900 ring-orange-500/25",
  },
  final: {
    label: "Final",
    Icon: Trophy,
    headerClass: "text-amber-950",
    badgeClass: "bg-amber-500/20 text-amber-950 ring-amber-500/35",
  },
};

export function knockoutMatchCardClass(stage: KnockoutStage, baseWidth = "w-[7.25rem]") {
  return cn(
    baseWidth,
    "rounded-lg border p-2 transition-shadow",
    stage === "default" &&
      "border-dashed border-neutral-300/80 bg-white/40",
    stage === "bronze" &&
      "border-solid border-orange-400/55 bg-gradient-to-br from-orange-50/95 via-amber-50/70 to-white/50 shadow-[0_4px_20px_rgba(234,88,12,0.12)] ring-1 ring-orange-400/25",
    stage === "final" &&
      "border-solid border-amber-400/70 bg-gradient-to-br from-amber-100/90 via-yellow-50/80 to-white/60 shadow-[0_8px_28px_rgba(245,158,11,0.22)] ring-2 ring-amber-400/35",
  );
}

export function knockoutRoundShellClass(stage: KnockoutStage) {
  return cn(
    "overflow-hidden rounded-xl",
    stage === "default" && "border border-dashed border-neutral-300/80",
    stage === "bronze" &&
      "border border-orange-300/60 bg-gradient-to-b from-orange-50/60 to-white/40 shadow-sm ring-1 ring-orange-400/15",
    stage === "final" &&
      "border border-amber-400/60 bg-gradient-to-b from-amber-100/50 to-amber-50/30 shadow-md ring-1 ring-amber-400/25",
  );
}

export function knockoutRoundHeaderClass(stage: KnockoutStage) {
  return cn(
    "border-b px-3 py-2.5 text-[0.75rem] font-semibold uppercase tracking-[0.08em]",
    stage === "default" && "border-black/[0.05] text-neutral-600",
    stage === "bronze" && "border-orange-200/80 bg-orange-500/10 text-orange-900",
    stage === "final" && "border-amber-300/80 bg-amber-500/15 text-amber-950",
  );
}
