import type { NewsArticle } from "@/lib/data/news-article";

export type NewsSectionKind =
  | "breaking-wide"
  | "breaking-stack"
  | "spotlight"
  | "quick-scan"
  | "timeline"
  | "digest"
  | "mosaic"
  | "latest";

export type NewsSectionPlan = {
  id: string;
  kind: NewsSectionKind;
  title: string;
  subtitle: string;
  articles: NewsArticle[];
};

const SECTION_META: Record<
  Exclude<NewsSectionKind, "latest">,
  { title: string; subtitle: string; size: number }
> = {
  "breaking-wide": {
    title: "Breaking",
    subtitle: "",
    size: 4,
  },
  "breaking-stack": {
    title: "Breaking desk",
    subtitle: "Priority headlines with full context",
    size: 4,
  },
  spotlight: {
    title: "Spotlight",
    subtitle: "",
    size: 3,
  },
  "quick-scan": {
    title: "Quick scan",
    subtitle: "Thumbnail grid for fast browsing",
    size: 6,
  },
  timeline: {
    title: "Timeline",
    subtitle: "",
    size: 1,
  },
  digest: {
    title: "Digest",
    subtitle: "Text-first reads when you want depth without images",
    size: 4,
  },
  mosaic: {
    title: "Mosaic",
    subtitle: "A mixed visual board of the wire",
    size: 4,
  },
};

const DYNAMIC_KINDS: Exclude<NewsSectionKind, "latest">[] = [
  "breaking-wide",
  "breaking-stack",
  "spotlight",
  "quick-scan",
  "timeline",
  "digest",
  "mosaic",
];

function hashString(value: string) {
  return value.split("").reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0);
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], seed: number) {
  const rng = mulberry32(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getNewsLayoutSeed(articles: NewsArticle[]) {
  const day = new Date().toISOString().slice(0, 10);
  const signature = articles.map((article) => article.id).join("|");
  return Math.abs(hashString(`${day}:${articles.length}:${signature}`));
}

export function buildNewsPageSections(
  filtered: NewsArticle[],
  featuredIds: Set<string>,
  seed: number,
): NewsSectionPlan[] {
  const pool = filtered.filter((article) => !featuredIds.has(article.id));
  if (pool.length === 0) return [];

  const rng = mulberry32(seed);
  const extraCount = pool.length >= 18 ? 2 : pool.length >= 12 ? 1 : 0;

  const shuffledKinds = shuffle(DYNAMIC_KINDS, seed + 17);
  const breakingKind = rng() > 0.5 ? "breaking-wide" : "breaking-stack";
  const pickedKinds: Exclude<NewsSectionKind, "latest">[] = [breakingKind, "timeline"];

  for (const kind of shuffledKinds) {
    if (pickedKinds.length >= 2 + extraCount) break;
    if (
      kind === breakingKind ||
      kind === "breaking-wide" ||
      kind === "breaking-stack" ||
      kind === "timeline"
    ) {
      continue;
    }
    pickedKinds.push(kind);
  }

  let cursor = 0;
  const dynamicSections: NewsSectionPlan[] = [];

  for (const kind of pickedKinds) {
    const meta = SECTION_META[kind];
    const articles = pool.slice(cursor, cursor + meta.size);
    cursor += meta.size;
    if (articles.length === 0) continue;

    dynamicSections.push({
      id: `${kind}-${articles[0]?.id ?? kind}`,
      kind,
      title: meta.title,
      subtitle: meta.subtitle,
      articles,
    });
  }

  const latestArticles = pool.slice(cursor);
  if (latestArticles.length > 0) {
    dynamicSections.push({
      id: `latest-${latestArticles[0]?.id ?? "stream"}`,
      kind: "latest",
      title: "Latest",
      subtitle: "",
      articles: latestArticles,
    });
  }

  const middle = dynamicSections.filter(
    (section) => section.kind !== "latest" && section.kind !== "timeline",
  );
  const timeline = dynamicSections.find((section) => section.kind === "timeline");
  const latest = dynamicSections.find((section) => section.kind === "latest");
  const shuffledMiddle = shuffle(middle, seed + 53);

  return [
    ...shuffledMiddle,
    ...(timeline ? [timeline] : []),
    ...(latest ? [latest] : []),
  ];
}
