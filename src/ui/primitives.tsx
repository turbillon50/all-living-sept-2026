import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "./cn";

/** Tarjeta contenida: blanca, hairline, radio de la casa. */
export function Card({ children, className, as: Tag = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "section" | "li" }) {
  return <Tag className={cn("rounded-[var(--radius-card)] bg-surface hairline", className)}>{children}</Tag>;
}

/** Acción en círculo: icono en aro + etiqueta debajo. Home, estancia, servicios. */
export function IconAction({ href, label, Icon, tone = "soft", className }: { href: string; label: string; Icon: LucideIcon; tone?: "soft" | "solid" | "outline"; className?: string }) {
  const circle =
    tone === "solid"
      ? "bg-accent text-on-accent"
      : tone === "outline"
        ? "bg-surface text-green-900 hairline"
        : "bg-accent-soft text-green-900";
  return (
    <Link href={href} className={cn("press flex flex-col items-center gap-2 text-center", className)}>
      <span className={cn("flex size-14 items-center justify-center rounded-full transition-colors", circle)}>
        <Icon size={22} strokeWidth={1.7} aria-hidden />
      </span>
      <span className="text-[12px] font-medium text-text-2">{label}</span>
    </Link>
  );
}

/** Fila de lista: icono en aro, título, subtítulo, chevron o contenido a la derecha. */
export function ListRow({ href, Icon, title, subtitle, right, className, onDark = false }: { href?: string; Icon?: LucideIcon; title: string; subtitle?: string; right?: React.ReactNode; className?: string; onDark?: boolean }) {
  const body = (
    <>
      {Icon ? (
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", onDark ? "bg-ivory/10 text-ivory" : "bg-accent-soft text-green-900")}>
          <Icon size={18} strokeWidth={1.7} aria-hidden />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[15px] font-medium truncate", onDark ? "text-ivory" : "text-text")}>{title}</span>
        {subtitle ? <span className={cn("block text-[13px] truncate", onDark ? "text-ivory/70" : "text-text-2")}>{subtitle}</span> : null}
      </span>
      {right ?? (href ? <ChevronRight size={18} className={onDark ? "text-ivory/60" : "text-muted"} aria-hidden /> : null)}
    </>
  );
  const cls = cn("flex min-h-14 items-center gap-3.5 px-4 py-2.5", href && "press hover:bg-surface-2", className);
  return href ? <Link href={href} className={cls}>{body}</Link> : <div className={cls}>{body}</div>;
}

/** Contenedor de filas: agrupa ListRow con separadores. */
export function RowGroup({ children, className, title }: { children: React.ReactNode; className?: string; title?: string }) {
  return (
    <section className={className}>
      {title ? <h2 className="mb-2 px-1 text-[12px] tracking-[0.24em] uppercase text-muted font-sans font-medium">{title}</h2> : null}
      <div className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline overflow-hidden">{children}</div>
    </section>
  );
}

/** Control segmentado (Propiedades · Fracciones · Favoritos). */
export function Segmented({ items, current, className }: { items: Array<{ key: string; label: string; href: string }>; current: string; className?: string }) {
  return (
    <nav className={cn("segmented", className)} aria-label="Secciones">
      {items.map((it) => (
        <Link key={it.key} href={it.href} aria-current={it.key === current ? "page" : undefined}>
          {it.label}
        </Link>
      ))}
    </nav>
  );
}

/** Pastillas de filtro (Todos · Playa · Montaña · Ciudad). */
export function FilterPills({ items, current, className }: { items: Array<{ key: string; label: string; href: string }>; current: string; className?: string }) {
  return (
    <ul className={cn("no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0", className)}>
      {items.map((it) => {
        const active = it.key === current;
        return (
          <li key={it.key} className="shrink-0">
            <Link href={it.href} aria-current={active ? "page" : undefined} className={cn("press inline-flex min-h-10 items-center rounded-[var(--radius-pill)] px-4 text-[13px] font-medium hairline transition-colors", active ? "bg-ink text-ivory border-ink" : "bg-surface text-text-2")}>
              {it.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Buscador en pastilla. Solo presentación: el formulario decide a dónde va. */
export function SearchBar({ placeholder, name = "q", action, defaultValue, className }: { placeholder: string; name?: string; action?: string; defaultValue?: string; className?: string }) {
  return (
    <form action={action} className={cn("relative", className)} role="search">
      <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
      <input type="search" name={name} defaultValue={defaultValue} placeholder={placeholder} aria-label={placeholder} className="min-h-12 w-full rounded-[var(--radius-pill)] bg-surface hairline pl-11 pr-4 text-[15px] placeholder:text-muted" />
    </form>
  );
}

/** Tile fotográfico: foto arriba, título y línea debajo. Grid de 2. */
export function PhotoTile({ href, src, alt, title, subtitle, ratio = "4/3", badge, sizes = "(max-width: 768px) 50vw, 25vw", className }: { href: string; src: string | null; alt: string; title: string; subtitle?: string; ratio?: string; badge?: React.ReactNode; sizes?: string; className?: string }) {
  return (
    <Link href={href} className={cn("press block", className)}>
      <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-sand-200" style={{ aspectRatio: ratio }}>
        {src ? <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" /> : null}
        {badge ? <span className="absolute left-2.5 top-2.5">{badge}</span> : null}
      </div>
      <p className="mt-2 text-[15px] font-medium leading-tight">{title}</p>
      {subtitle ? <p className="text-[12.5px] text-text-2">{subtitle}</p> : null}
    </Link>
  );
}

/** Icono en tile cuadrado (Destacados · Yates · Chefs · Niñeras). */
export function IconTile({ href, label, Icon, active }: { href: string; label: string; Icon: LucideIcon; active?: boolean }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={cn("press flex flex-col items-center gap-2 rounded-[var(--radius-card)] px-2 py-3.5 hairline", active ? "bg-accent-soft border-green-100" : "bg-surface")}>
      <Icon size={22} strokeWidth={1.6} className="text-green-900" aria-hidden />
      <span className="text-[12px] font-medium text-text-2">{label}</span>
    </Link>
  );
}

/** Panel de marca en verde profundo: cabecera de perfil, proveedor, pass. */
export function BrandPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("-mx-5 md:mx-0 md:rounded-[var(--radius-panel)] bg-green-950 px-5 pt-safe text-ivory", className)}>{children}</section>;
}

/** Cabecera de página con hero fotográfico a sangre y texto encima. */
export function HeroHeader({ src, alt, eyebrow, title, subtitle, children, height = "min-h-[380px]", priority = true }: { src: string; alt: string; eyebrow?: string; title: React.ReactNode; subtitle?: string; children?: React.ReactNode; height?: string; priority?: boolean }) {
  return (
    <header className={cn("relative -mx-5 overflow-hidden md:mx-0 md:rounded-[var(--radius-panel)]", height)}>
      <Image src={src} alt={alt} fill priority={priority} sizes="(max-width: 768px) 100vw, 1152px" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-green-950/35 via-green-950/10 to-green-950/70" />
      <div className="relative flex h-full min-h-[inherit] flex-col justify-between px-5 pt-safe pb-5 text-ivory">
        <div className="pt-8 fade-up">
          {eyebrow ? <p className="text-[11px] tracking-[0.3em] uppercase text-ivory/75">{eyebrow}</p> : null}
          <h1 className="mt-2 text-[36px] leading-[1.04] md:text-[48px] text-balance">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-md text-[16px] text-ivory/85">{subtitle}</p> : null}
        </div>
        {children}
      </div>
    </header>
  );
}
