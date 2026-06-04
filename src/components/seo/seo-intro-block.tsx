import { leaguesGlassInset } from "@/components/leagues/leagues-glass";
import { cn } from "@/lib/utils";

type SeoIntroBlockProps = {
  paragraphs: string[];
  className?: string;
};

/** Visible, crawlable copy for entity pages (FotMob-style SEO body). */
export function SeoIntroBlock({ paragraphs, className }: SeoIntroBlockProps) {
  if (paragraphs.length === 0) return null;

  return (
    <section
      className={cn(leaguesGlassInset, "rounded-2xl px-5 py-4 sm:px-6 sm:py-5", className)}
      aria-label="Page summary"
    >
      <div className="space-y-2.5">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="text-[0.8125rem] leading-relaxed text-neutral-600 sm:text-[0.875rem]"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
