import { cn } from "@/lib/utils";

export function CaptainIcon({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "xs" | "sm" | "pitch";
}) {
  return (
    <span
      title="Captain"
      aria-label="Captain"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[2px] bg-amber-500 font-bold leading-none text-white ring-1 ring-amber-600/30",
        size === "xs" && "h-[0.85em] min-w-[0.85em] px-[0.12em] text-[0.62em]",
        size === "pitch" && "h-[0.982em] min-w-[0.982em] px-[0.139em] text-[0.716em]",
        size === "sm" && "h-3.5 min-w-3.5 px-[0.2rem] text-[0.5625rem]",
        className,
      )}
    >
      C
    </span>
  );
}
