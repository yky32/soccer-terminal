import type { MetadataRoute } from "next";
import { ENABLE_AI, ENABLE_NEWS } from "@/lib/feature-flags";
import { LEAGUE_CATALOG } from "@/lib/football/league-catalog";
import { absoluteUrl } from "@/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: absoluteUrl("/leagues"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...LEAGUE_CATALOG.map((league) => ({
      url: absoluteUrl(`/leagues/${league.id}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.85,
    })),
  ];

  if (ENABLE_NEWS) {
    entries.push({
      url: absoluteUrl("/news"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8,
    });
  }

  if (ENABLE_AI) {
    entries.push({
      url: absoluteUrl("/assistant"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return entries;
}
