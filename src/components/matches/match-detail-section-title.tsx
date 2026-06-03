import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type MatchDetailSectionTitleProps = {
  icon: LucideIcon;
  children: string;
  className?: string;
  as?: "h2" | "p";
  size?: "md" | "sm";
};

export function MatchDetailSectionTitle({
  icon: Icon,
  children,
  className,
  as: Tag = "h2",
  size = "md",
}: MatchDetailSectionTitleProps) {
  return (
    <Tag
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold uppercase text-neutral-500",
        size === "sm"
          ? "text-[0.625rem] tracking-[0.1em]"
          : "text-[0.6875rem] tracking-[0.1em]",
        className,
      )}
    >
      <Icon
        className={cn(
          "shrink-0 text-neutral-400",
          size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5",
        )}
        strokeWidth={2}
        aria-hidden
      />
      {children}
    </Tag>
  );
}
