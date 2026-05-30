"use client";

import { useState } from "react";
import { EUR_FLAG_URL } from "@/lib/data/currency-flag";
import { cn } from "@/lib/utils";

type CurrencyFlagProps = {
  size?: "xs" | "sm";
  className?: string;
};

const sizeClass = {
  xs: "h-3.5 w-5",
  sm: "h-4 w-6",
} as const;

export function CurrencyFlag({ size = "sm", className }: CurrencyFlagProps) {
  const [failed, setFailed] = useState(false);
  const dim = sizeClass[size];

  if (failed) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-sm bg-neutral-200/80 text-[0.5625rem] font-bold text-neutral-500 ring-1 ring-black/[0.06]",
          dim,
          className,
        )}
        aria-hidden
      >
        €
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={EUR_FLAG_URL}
      alt=""
      className={cn("inline-block shrink-0 rounded-sm object-cover ring-1 ring-black/[0.06]", dim, className)}
      onError={() => setFailed(true)}
    />
  );
}
