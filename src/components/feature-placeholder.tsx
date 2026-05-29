type FeaturePlaceholderProps = {
  milestones: string[];
};

export function FeaturePlaceholder({ milestones }: FeaturePlaceholderProps) {
  return (
    <section className="page-container pb-16 sm:pb-24">
      <div className="rounded-2xl border border-border bg-surface p-8 sm:p-10">
        <p className="text-label font-semibold uppercase tracking-[0.06em] text-muted">
          In development
        </p>
        <h2 className="text-heading mt-5 font-semibold text-foreground">Coming next</h2>
        <ul className="mt-10 space-y-6">
          {milestones.map((milestone, index) => (
            <li key={milestone} className="flex gap-5 sm:gap-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background text-body font-semibold text-foreground">
                {index + 1}
              </span>
              <span className="text-body-large pt-1.5 text-muted">{milestone}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
