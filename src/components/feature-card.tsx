import Link from "next/link";
import { ChevronRight } from "@/components/app-shell";

type FeatureCardProps = {
  href: string;
  title: string;
  description: string;
};

export function FeatureCard({ href, title, description }: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group flex min-h-[240px] flex-col justify-between rounded-2xl bg-surface p-8 transition-colors hover:bg-surface-hover sm:min-h-[260px] sm:p-9"
    >
      <div>
        <h2 className="text-subheading font-semibold text-foreground">{title}</h2>
        <p className="text-body mt-4 text-muted">{description}</p>
      </div>
      <div className="text-body mt-10 flex items-center gap-2 font-semibold text-foreground">
        <span>Open</span>
        <ChevronRight />
      </div>
    </Link>
  );
}
