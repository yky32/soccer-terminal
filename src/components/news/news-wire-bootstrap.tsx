"use client";

import { useEffect } from "react";
import type { NewsArticle } from "@/lib/data/news-article";
import { useNewsWireSlot } from "@/components/news/news-wire-slot-context";

type NewsWireBootstrapProps = {
  headlines: NewsArticle[];
};

export function NewsWireBootstrap({ headlines }: NewsWireBootstrapProps) {
  const { setWireHeadlines } = useNewsWireSlot();

  useEffect(() => {
    setWireHeadlines(headlines.slice(0, 6));
    return () => setWireHeadlines(null);
  }, [headlines, setWireHeadlines]);

  return null;
}
