type FeaturePlaceholderProps = {
  milestones: string[];
};

export function FeaturePlaceholder({ milestones }: FeaturePlaceholderProps) {
  return (
    <section className="px-6 py-8">
      <div className="rounded-xl border border-dashed border-border bg-surface p-6">
        <h2 className="text-sm font-medium">Coming next</h2>
        <ul className="mt-4 space-y-2">
          {milestones.map((milestone) => (
            <li key={milestone} className="flex gap-2 text-sm text-muted">
              <span className="text-accent">—</span>
              <span>{milestone}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
