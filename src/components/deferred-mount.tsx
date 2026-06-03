"use client";

import type { ReactNode } from "react";
import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

type DeferredMountProps = {
  children: ReactNode;
  placeholder: ReactNode;
  rootMargin?: string;
  className?: string;
};

/** Mount children only when the placeholder enters (or nears) the viewport. */
export function DeferredMount({
  children,
  placeholder,
  rootMargin = "240px 0px",
  className,
}: DeferredMountProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin, once: true });

  return (
    <div ref={ref} className={cn(className)}>
      {inView ? children : placeholder}
    </div>
  );
}
