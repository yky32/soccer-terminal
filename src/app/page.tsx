import { FeatureCard } from "@/components/feature-card";
import { PageHeader } from "@/components/page-header";
import { WorldMapPreview } from "@/components/overview/world-map-preview";
import { mainNav } from "@/lib/navigation";

const featureNav = mainNav.filter((item) => item.href !== "/");

export default function Home() {
  return (
    <>
      <PageHeader
        title="Monitor football everywhere."
        description="Live matches, deep analytics, and scouting intelligence — built for analysts, coaches, and serious football professionals."
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
        <div className="page-container grid gap-14 py-20 sm:grid-cols-3 sm:py-24">
          <div>
            <p className="text-heading font-semibold">Live</p>
            <p className="text-body mt-4 text-muted">
              Real-time match monitoring across leagues worldwide.
            </p>
          </div>
          <div>
            <p className="text-heading font-semibold">Deep</p>
            <p className="text-body mt-4 text-muted">
              Analytics and scouting tools beyond consumer apps.
            </p>
          </div>
          <div>
            <p className="text-heading font-semibold">Clear</p>
            <p className="text-body mt-4 text-muted">
              Simple, scannable interface so you act faster.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
