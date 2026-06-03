import { cn } from "@/lib/utils";

export function MapSectionSkeleton({
  variant = "map",
  className,
}: {
  variant?: "map" | "monitor" | "compact";
  className?: string;
}) {
  if (variant === "monitor") {
    return (
      <section
        className={cn("page-container py-8 sm:py-10", className)}
        aria-busy="true"
        aria-label="Loading match monitor"
      >
        <div className="mb-4 h-7 w-40 animate-pulse rounded-lg bg-black/[0.06]" />
        <div className="h-[min(28rem,50vh)] animate-pulse rounded-[1.25rem] bg-black/[0.05]" />
      </section>
    );
  }

  const heightClass =
    variant === "compact"
      ? "min-h-[128px] lg:min-h-[220px]"
      : "h-[min(92vh,calc(100dvh-4.25rem))] min-h-[30rem] sm:min-h-[34rem]";

  return (
    <div
      className={cn(
        "relative w-full animate-pulse overflow-hidden rounded-none bg-black/[0.04]",
        heightClass,
        className,
      )}
      aria-busy="true"
      aria-label="Loading map"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-200/40 via-neutral-100/20 to-neutral-200/30" />
    </div>
  );
}

export function GlobalPageSkeleton() {
  return (
    <div className="space-y-0">
      <div className="page-container pt-10 pb-6 sm:pt-12">
        <div className="h-9 w-64 max-w-full animate-pulse rounded-lg bg-black/[0.06]" />
        <div className="mt-3 h-5 w-full max-w-xl animate-pulse rounded-lg bg-black/[0.04]" />
      </div>
      <MapSectionSkeleton variant="map" />
      <MapSectionSkeleton variant="monitor" />
    </div>
  );
}

export function LeaguesPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="page-container pt-10 pb-6 sm:pt-12">
        <div className="h-9 w-56 animate-pulse rounded-lg bg-black/[0.06]" />
        <div className="mt-3 h-5 w-full max-w-lg animate-pulse rounded-lg bg-black/[0.04]" />
      </div>
      <div className="page-container">
        <div className="mb-4 flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-8 w-20 shrink-0 animate-pulse rounded-full bg-black/[0.05]"
            />
          ))}
        </div>
        <div className="overflow-hidden rounded-[1.25rem] border border-black/[0.06] bg-white/50">
          <div className="grid lg:grid-cols-[minmax(0,4fr)_minmax(0,1fr)]">
            <div className="space-y-4 p-5">
              <div className="flex gap-3">
                <div className="h-14 w-14 animate-pulse rounded-full bg-black/[0.06]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-black/[0.05]" />
                  <div className="h-7 w-48 animate-pulse rounded bg-black/[0.06]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-14 animate-pulse rounded-lg bg-black/[0.04]" />
                ))}
              </div>
            </div>
            <MapSectionSkeleton variant="compact" className="rounded-none" />
          </div>
        </div>
        <div className="mt-4 h-72 animate-pulse rounded-[1.25rem] bg-black/[0.05]" />
      </div>
    </div>
  );
}

export function MatchDetailPageSkeleton() {
  return (
    <div className="page-container space-y-6 py-8 sm:py-10">
      <div className="h-9 w-24 animate-pulse rounded-full bg-black/[0.05]" />
      <div className="h-48 animate-pulse rounded-[1.25rem] bg-black/[0.05] sm:h-56" />
      <div className="flex gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-5 w-20 animate-pulse rounded bg-black/[0.04]" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-[1.25rem] bg-black/[0.05]" />
    </div>
  );
}
