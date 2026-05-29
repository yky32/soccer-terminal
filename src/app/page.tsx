import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { mainNav } from "@/lib/navigation";

const featureNav = mainNav.filter((item) => item.href !== "/");

export default function Home() {
  return (
    <>
      <PageHeader
        eyebrow="Soccer intelligence platform"
        title="Your command center for global football"
        description="Real-time match monitoring, deep analytics, and scouting tools — built for analysts, coaches, and serious football professionals."
      />

      <section className="grid gap-4 px-6 py-8 sm:grid-cols-2">
        {featureNav.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent/40"
          >
            <h2 className="text-base font-medium">{feature.label}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {feature.description}
            </p>
          </Link>
        ))}
      </section>
    </>
  );
}
