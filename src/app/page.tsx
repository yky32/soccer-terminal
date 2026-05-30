import type { Metadata } from "next";
import { FeatureCard } from "@/components/feature-card";
import { PageHeader } from "@/components/page-header";
import { WorldMapPreview } from "@/components/overview/world-map-preview";
import { mainNav } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Global",
};

const featureNav = mainNav.filter((item) => item.href !== "/");

export default function Home() {
  return (
    <>
      <PageHeader
        title="Monitor football everywhere."
        description="Live and upcoming matches on a global map — with news, league coverage, and AI insights when you need them."
      />

      <WorldMapPreview />

      <section className="page-container pb-16 pt-16 sm:pb-24 sm:pt-20">
        <h2 className="text-heading mb-12 font-semibold text-foreground">
          Explore the platform
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureNav.map((feature) => (
            <FeatureCard
              key={feature.href}
              href={feature.href}
              title={feature.label}
              description={feature.description}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="page-container grid gap-14 py-20 sm:grid-cols-2 sm:py-24 lg:grid-cols-4">
          {mainNav.map((item) => (
            <div key={item.href}>
              <p className="text-heading font-semibold">{item.shortLabel}</p>
              <p className="text-body mt-4 text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
