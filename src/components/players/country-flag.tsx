"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { countryFlagUrl } from "@/lib/data/nationality-flag";
import { cn } from "@/lib/utils";

type CountryFlagProps = {
  nationality: string;
  src?: string | null;
  size?: "xs" | "sm" | "md";
  className?: string;
};

const sizePx = {
  xs: { width: 20, height: 14 },
  sm: { width: 24, height: 16 },
  md: { width: 28, height: 20 },
} as const;

const sizeClass = {
  xs: "h-3.5 w-5",
  sm: "h-4 w-6",
  md: "h-5 w-7",
} as const;

function isApiSportsFlagUrl(src: string) {
  try {
    return new URL(src).hostname === "media.api-sports.io";
  } catch {
    return false;
  }
}

export function CountryFlag({
  nationality,
  src: srcProp,
  size = "sm",
  className,
}: CountryFlagProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const resolvedSrc = useMemo(
    () => countryFlagUrl(nationality, srcProp),
    [nationality, srcProp],
  );
  const dim = sizeClass[size];
  const px = sizePx[size];

  useEffect(() => {
    setFailedSrc(null);
  }, [nationality, srcProp, resolvedSrc]);

  if (!resolvedSrc || failedSrc === resolvedSrc) {
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

  if (isApiSportsFlagUrl(resolvedSrc)) {
    return (
      <Image
        src={resolvedSrc}
        alt=""
        width={px.width}
        height={px.height}
        sizes={`${px.width}px`}
        loading="lazy"
        onError={() => setFailedSrc(resolvedSrc)}
        className={cn(
          "inline-block shrink-0 rounded-sm object-cover ring-1 ring-black/[0.06]",
          dim,
          className,
        )}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolvedSrc}
      alt=""
      loading="lazy"
      decoding="async"
      className={cn(
        "inline-block shrink-0 rounded-sm object-cover ring-1 ring-black/[0.06]",
        dim,
        className,
      )}
      onError={() => setFailedSrc(resolvedSrc)}
    />
  );
}
