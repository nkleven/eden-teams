type Action = { label: string; href: string };

export function Shell({
  title,
  description,
  primaryAction,
  children,
}: {
  title: string;
  description?: string;
  primaryAction?: Action;
  children: React.ReactNode;
}) {
  return (
    <main className="px-4 py-6 md:px-8">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-ink/60">
            Edens Gate
          </p>
          <h1 className="text-3xl font-semibold text-ink">{title}</h1>
          {description && <p className="mt-2 text-ink/70">{description}</p>}
        </div>
        {primaryAction && (
          <a
            className="rounded-md bg-iris px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-strong"
            href={primaryAction.href}
          >
            {primaryAction.label}
          </a>
        )}
      </header>
      {children}
    </main>
  );
}
