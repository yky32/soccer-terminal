type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  compact?: boolean;
  /** Stronger contrast when sitting on glass / colored backdrops */
  onGlass?: boolean;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  compact = false,
  onGlass = false,
}: PageHeaderProps) {
  return (
    <header
      className={`page-container ${compact ? "pt-10 pb-8 sm:pt-12 sm:pb-10" : "pt-14 pb-10 sm:pt-20 sm:pb-14"}`}
    >
      {eyebrow ? (
        <p
          className={`text-label mb-4 font-medium uppercase tracking-[0.06em] ${
            onGlass ? "text-foreground/70" : "text-muted"
          }`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={`max-w-4xl font-semibold ${
          compact ? "text-title" : "text-display"
        } ${onGlass ? "text-neutral-950" : "text-foreground"}`}
      >
        {title}
      </h1>
      <p
        className={`text-body-large mt-7 max-w-3xl sm:mt-8 ${
          onGlass ? "text-neutral-700" : "text-muted"
        }`}
      >
        {description}
      </p>
    </header>
  );
}
