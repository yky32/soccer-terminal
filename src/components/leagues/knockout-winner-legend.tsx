import { cn } from "@/lib/utils";

const LEGEND_ITEMS = [
  {
    kind: "regulation" as const,
    label: "Won on score",
    swatchClass: "bg-emerald-500/12 ring-1 ring-emerald-500/25",
  },
  {
    kind: "draw-decided" as const,
    label: "Won after a draw",
    swatchClass: "bg-orange-500/12 ring-1 ring-orange-500/25",
  },
];

export function KnockoutWinnerLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-black/[0.06] bg-white/75 px-2 py-1.5 shadow-sm backdrop-blur-sm",
        className,
      )}
      aria-label="How winner highlights work"
    >
      <p className="mb-1 text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        Highlights
      </p>
      <ul className="space-y-1">
        {LEGEND_ITEMS.map((item) => (
          <li key={item.kind} className="flex items-center gap-1.5">
            <span
              className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", item.swatchClass)}
              aria-hidden
            />
            <span className="text-[0.625rem] leading-tight text-neutral-600">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
