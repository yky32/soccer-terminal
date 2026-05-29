type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="border-b border-border px-6 py-8">
      {eyebrow ? (
        <p className="mb-2 text-sm font-medium text-accent">{eyebrow}</p>
      ) : null}
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        {description}
      </p>
    </header>
  );
}
