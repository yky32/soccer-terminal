type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  compact?: boolean;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  compact = false,
}: PageHeaderProps) {
  return (
    <header
      className={`page-container ${compact ? "pt-10 pb-8 sm:pt-12 sm:pb-10" : "pt-14 pb-10 sm:pt-20 sm:pb-14"}`}
    >
      {eyebrow ? (
        <p className="text-label mb-4 font-medium uppercase tracking-[0.06em] text-muted">
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={`max-w-4xl font-semibold text-foreground ${
          compact ? "text-title" : "text-display"
        }`}
      >
        {title}
      </h1>
      <p className="text-body-large mt-7 max-w-3xl text-muted sm:mt-8">{description}</p>
    </header>
  );
}
