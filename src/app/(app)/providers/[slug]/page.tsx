import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { providerBySlug } from "@/domains/services/queries";
import { categoryBySlug } from "@/domains/services/categories";
import { money } from "@/core/format";
import { Page, Section } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Photo } from "@/ui/photo";
import { Chip } from "@/ui/chip";
import { ButtonLink } from "@/ui/button";

export const dynamic = "force-dynamic";

/** Pantalla 31: detalle de proveedor. Fotografía protagonista; solo reseñas reales. */
export default async function ProviderDetail({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ stay?: string }> }) {
  const { slug } = await params;
  const { stay } = await searchParams;
  const p = await providerBySlug(slug);
  if (!p || p.status !== "approved") notFound();
  const cat = categoryBySlug(p.primaryCategory);
  const hero = p.gallery[0] ?? p.services[0]?.coverUrl ?? null;
  return (
    <Page wide>
      <TopBar back={`/services/${p.primaryCategory}`} title={p.businessName} />
      {hero ? <Photo src={hero} alt={p.businessName} priority className="mt-2" ratio="3/2" sizes="(max-width: 768px) 100vw, 1152px" /> : null}
      {p.gallery.length > 1 ? <ul className="no-scrollbar mt-3 -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">{p.gallery.slice(1).map((g) => <li key={g} className="w-28 shrink-0"><Photo src={g} alt="" ratio="1/1" sizes="112px" /></li>)}</ul> : null}
      <header className="mt-6 flex items-start gap-4">
        {p.logoUrl ? <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-sand-200"><Image src={p.logoUrl} alt="" fill sizes="56px" className="object-cover" /></span> : null}
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-[30px] leading-[1.06]">{p.businessName}{p.status === "approved" ? <BadgeCheck size={22} className="text-green-900" aria-label="All Living Verified" /> : null}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-2">
            {cat ? <span>{cat.label}</span> : null}
            {p.areas.length ? <span className="flex items-center gap-1"><MapPin size={14} aria-hidden /> {p.areas.join(", ")}</span> : null}
            {p.rating ? <span className="flex items-center gap-1"><Star size={14} aria-hidden /> {p.rating.avg.toFixed(1)} ({p.rating.count})</span> : <span className="text-muted">Sin reseñas todavía</span>}
          </p>
        </div>
        {p.isDemo ? <Chip>Demo</Chip> : null}
      </header>
      {p.description ? <p className="mt-4 max-w-prose text-[16px] leading-relaxed">{p.description}</p> : null}
      <Chip tone="accent" className="mt-4">All Living Verified</Chip>

      <Section title="Servicios">
        <ul className="grid gap-3 md:grid-cols-2">
          {p.services.map((s) => (
            <li key={s.id} className="flex gap-4 rounded-[var(--radius-card)] bg-surface hairline p-3">
              {s.coverUrl ? <Photo src={s.coverUrl} alt="" className="w-24 shrink-0" ratio="1/1" sizes="96px" /> : null}
              <div className="min-w-0 flex-1">
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-text-2">{s.durationMin ? `${Math.round(s.durationMin / 60)} h · ` : ""}{s.maxPeople ? `hasta ${s.maxPeople} personas` : ""}</p>
                <p className="mt-1 text-sm">{s.priceFrom ? <>desde <strong>{money(s.priceFrom, s.currency)}</strong> / {s.unit}</> : "A cotizar"}</p>
                <div className="mt-2"><ButtonLink href={`/book/${s.id}${stay ? `?stay=${stay}` : ""}`} size="sm">Solicitar</ButtonLink></div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {p.services[0]?.cancellationPolicy ? <Section title="Cancelación"><p className="text-sm text-text-2">{p.services[0].cancellationPolicy}</p></Section> : null}

      {p.reviews.length > 0 ? (
        <Section title="Reseñas">
          <ul className="flex flex-col gap-3">{p.reviews.map((r) => <li key={r.id} className="rounded-[var(--radius-card)] bg-surface hairline p-4 text-sm"><p className="flex items-center gap-1 font-medium"><Star size={14} aria-hidden /> {r.rating}/5{r.isDemo ? " · demo" : ""}</p>{r.body ? <p className="mt-1 text-text-2">{r.body}</p> : null}</li>)}</ul>
        </Section>
      ) : null}
      <p className="mt-10 text-[12px] text-muted">¿Eres proveedor? <Link href="/pro/onboarding" className="text-green-900 underline underline-offset-4">Trabaja con All Living</Link>.</p>
    </Page>
  );
}
