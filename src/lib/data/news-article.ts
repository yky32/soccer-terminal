export type NewsCategory =
  | "transfer"
  | "match-report"
  | "preview"
  | "injury"
  | "analysis";

export type NewsArticle = {
  id: string;
  headline: string;
  excerpt: string;
  body?: string;
  publishedAt: string;
  category: NewsCategory;
  league: string;
  leagueLogo: string | null;
  imageUrl: string;
  imageAlt: string;
  featured?: boolean;
};

export const NEWS_CATEGORY_META: Record<
  NewsCategory,
  { label: string; accent: string; accentBar: string; badge: string }
> = {
  transfer: {
    label: "Transfer",
    accent: "border-l-amber-500",
    accentBar: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-800 ring-amber-500/20",
  },
  "match-report": {
    label: "Match Report",
    accent: "border-l-emerald-500",
    accentBar: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-800 ring-emerald-500/20",
  },
  preview: {
    label: "Preview",
    accent: "border-l-sky-500",
    accentBar: "bg-sky-500",
    badge: "bg-sky-500/10 text-sky-800 ring-sky-500/20",
  },
  injury: {
    label: "Injury",
    accent: "border-l-rose-500",
    accentBar: "bg-rose-500",
    badge: "bg-rose-500/10 text-rose-800 ring-rose-500/20",
  },
  analysis: {
    label: "Analysis",
    accent: "border-l-violet-500",
    accentBar: "bg-violet-500",
    badge: "bg-violet-500/10 text-violet-800 ring-violet-500/20",
  },
};

export function getCategoryAccent(category: NewsCategory) {
  return NEWS_CATEGORY_META[category].accent;
}

export function getCategoryAccentBar(category: NewsCategory) {
  return NEWS_CATEGORY_META[category].accentBar;
}
