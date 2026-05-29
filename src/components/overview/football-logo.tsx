"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type FootballLogoProps = {
  src: string | null | undefined;
  label: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
};

const sizeClass = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

export function FootballLogo({
  src,
  label,
  size = "sm",
  className,
}: FootballLogoProps) {
  const [failed, setFailed] = useState(false);
  const dim = sizeClass[size];

  if (!src || failed) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded bg-neutral-100 ring-1 ring-neutral-200/80",
          dim,
          className,
        )}
        aria-hidden
      >
        <span className="text-[8px] font-bold uppercase text-neutral-500">
          {label.trim().charAt(0) || "?"}
        </span>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external CDN logos from API-Football
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("shrink-0 object-contain", dim, className)}
    />
  );
}
