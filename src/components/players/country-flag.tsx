"use client";

import { useState } from "react";
import { nationalityFlagUrl } from "@/lib/data/nationality-flag";
import { cn } from "@/lib/utils";

type CountryFlagProps = {
  nationality: string;
  size?: "xs" | "sm" | "md";
  className?: string;
};

const sizeClass = {
  xs: "h-3.5 w-5",
  sm: "h-4 w-6",
  md: "h-5 w-7",
} as const;

export function CountryFlag({ nationality, size = "sm", className }: CountryFlagProps) {
  const [failed, setFailed] = useState(false);
  const src = nationalityFlagUrl(nationality);
  const dim = sizeClass[size];

  if (!src || failed) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-sm bg-neutral-200/80 text-[0.5rem] font-bold uppercase text-neutral-500 ring-1 ring-black/[0.06]",
          dim,
          className,
        )}
        aria-hidden
      >
        {nationality.slice(0, 2)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={cn("inline-block shrink-0 rounded-sm object-cover ring-1 ring-black/[0.06]", dim, className)}
      onError={() => setFailed(true)}
    />
  );
}
