import type { Metadata } from "next";
import { FeatureCard } from "@/components/feature-card";
import { glass } from "@/components/glass-surface";
import { GlobalPageHeader } from "@/components/overview/global-page-header";
import { MatchMonitorSection } from "@/components/overview/match-monitor-section";
import { WorldMapPreview } from "@/components/overview/world-map-preview";
import { mainNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Global",
};

const featureNav = mainNav.filter((item) => item.href !== "/");

export default function Home() {
  return (
    <>
      <GlobalPageHeader />

      <WorldMapPreview />

      <MatchMonitorSection />

      <section className="page-container pb-16 pt-16 sm:pb-24 sm:pt-20">
        <div className={cn(glass, "p-8 sm:p-10 lg:p-12")}>
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
        </div>
      </section>

      <section className="page-container pb-16 sm:pb-24">
        <div className={cn(glass, "grid gap-14 p-8 sm:grid-cols-2 sm:p-12 sm:py-16 lg:grid-cols-4")}>
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
