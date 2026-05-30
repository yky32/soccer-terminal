"use client";

import { useEffect, useRef, useState } from "react";
import { useAppChrome } from "@/components/app-chrome-context";

/** Matches sticky `top-[7.75rem] md:top-[4.25rem]` offsets in feed filter/rail bars. */
function stickyRootMargin() {
  const top =
    typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
      ? 68
      : 124;
  return `-${top}px 0px 0px 0px`;
}

export function useStickyChromeHide() {
  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { setHeaderHidden } = useAppChrome();

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    let observer: IntersectionObserver;

    const observe = () => {
      observer?.disconnect();
      observer = new IntersectionObserver(
        ([entry]) => setIsStuck(!entry.isIntersecting),
        { threshold: 0, rootMargin: stickyRootMargin() },
      );
      observer.observe(sentinel);
    };

    observe();
    const mq = window.matchMedia("(min-width: 768px)");
    mq.addEventListener("change", observe);
    return () => {
      observer.disconnect();
      mq.removeEventListener("change", observe);
    };
  }, []);

  useEffect(() => {
    setHeaderHidden(isStuck);
    return () => setHeaderHidden(false);
  }, [isStuck, setHeaderHidden]);

  return { isStuck, sentinelRef };
}
