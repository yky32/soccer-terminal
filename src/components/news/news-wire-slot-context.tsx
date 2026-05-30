"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { NewsArticle } from "@/lib/data/news-article";

type NewsWireSlotContextValue = {
  wireHeadlines: NewsArticle[] | null;
  setWireHeadlines: (headlines: NewsArticle[] | null) => void;
};

const NewsWireSlotContext = createContext<NewsWireSlotContextValue | null>(null);

export function NewsWireSlotProvider({ children }: { children: React.ReactNode }) {
  const [wireHeadlines, setWireHeadlinesState] = useState<NewsArticle[] | null>(null);

  const setWireHeadlines = useCallback((headlines: NewsArticle[] | null) => {
    setWireHeadlinesState(headlines);
  }, []);

  const value = useMemo(
    () => ({ wireHeadlines, setWireHeadlines }),
    [wireHeadlines, setWireHeadlines],
  );

  return (
    <NewsWireSlotContext.Provider value={value}>{children}</NewsWireSlotContext.Provider>
  );
}

export function useNewsWireSlot() {
  const context = useContext(NewsWireSlotContext);
  if (!context) {
    throw new Error("useNewsWireSlot must be used within NewsWireSlotProvider");
  }
  return context;
}
