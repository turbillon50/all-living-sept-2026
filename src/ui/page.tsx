import { cn } from "./cn";

/** Contenedor de página: ancho legible en escritorio, respiro en móvil, espacio para la tabbar. */
export function Page({ children, className, wide = false }: { children: React.ReactNode; className?: string; wide?: boolean }) {
  return (
    <main className={cn("mx-auto w-full px-5 pt-safe pb-tabbar md:px-8 md:pb-12", wide ? "max-w-6xl" : "max-w-2xl", className)}>
      {children}
    </main>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-end justify-between gap-4 pt-8 pb-5 md:pt-12 md:pb-8">
      <div className="min-w-0">
        {eyebrow ? <p className="text-[11px] tracking-[0.28em] uppercase text-muted mb-2">{eyebrow}</p> : null}
        <h1 className="text-[30px] leading-[1.08] md:text-[40px]">{title}</h1>
        {description ? <p className="mt-2 text-text-2 max-w-prose">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function Section({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("mt-8 md:mt-10", className)}>
      {title ? (
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-[19px] md:text-[22px]">{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
