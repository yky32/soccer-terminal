"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type PlayerAvatarProps = {
  src: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClass = {
  sm: "h-7 w-7 text-[0.625rem]",
  md: "h-8 w-8 text-[0.625rem]",
  lg: "h-16 w-16 text-[0.875rem] sm:h-20 sm:w-20",
} as const;

export function PlayerAvatar({
  src,
  name,
  size = "md",
  className,
}: PlayerAvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!src || failed) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-white/40 font-bold text-neutral-600 ring-1 ring-black/[0.08]",
          sizeClass[size],
          className,
        )}
        aria-hidden
      >
        {initials || "?"}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external Unsplash mock avatars
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn(
        "shrink-0 rounded-full object-cover ring-1 ring-black/[0.08]",
        sizeClass[size],
        className,
      )}
    />
  );
}
