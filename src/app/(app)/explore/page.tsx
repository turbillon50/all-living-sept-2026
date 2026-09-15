import Link from "next/link";
import { activeProperties } from "@/domains/properties/queries";
import { searchTimeInventory } from "@/domains/inventory/queries";
import { Page, Section } from "@/ui/page";
import { Chip } from "@/ui/chip";
import { EmptyState } from "@/ui/empty-state";
import { PhotoTile } from "@/ui/primitives";
import { Photo } from "@/ui/photo";
import { money, formatRange } from "@/core/format";

const DESTINATIONS = [
  { slug: "cancun", name: "Cancún", tags: "Mar · Islas · Gastronomía", photo: "/demo/palms.webp" },
  { slug: "playa-del-carmen", name: "Playa del Carmen", tags: "Playa · Ciudad · Riviera", photo: "/demo/villa-pool.webp" },
  { slug: "tulum", name: "Tulum", tags: "Mar · Selva · Wellness", photo: "/demo/tulum-sea.webp" },
];
export const dynamic = "force-dynamic";

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ destination?: string; checkIn?: string; checkOut?: string; guests?: string }> }) {
  const q = await searchParams;
  const destination = q.destination ?? "";
  const guests = Math.max(1, Math.min(30, Number(q.guests ?? 2) || 2));
  const hasDates = Boolean(q.checkIn && q.checkOut);
  const [properties, inventory] = await Promise.all([
    activeProperties(),
    hasDates ? searchTimeInventory({ destination: destination || undefined, checkIn: q.checkIn, checkOut: q.checkOut, guests }) : Promise.resolve([]),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <Page wide>
      <section className="travel-hero">
        <div className="travel-hero-copy"><p className="travel-kicker">CARIBE MEXICANO</p><h1>Tu próxima historia empieza aquí.</h1><p>Quédate, muévete, come, navega y descubre. Cancún, Playa del Carmen y Tulum en una sola experiencia.</p></div>
        <div className="travel-hero-glow" aria-hidden />
      </section>
      <form action="/explore" className="grid gap-2 rounded-[26px] bg-surface p-3 hairline md:grid-cols-[1.35fr_1fr_1fr_.7fr_auto] md:items-end">
        <label className="grid gap-1.5"><span className="px-1 text-[11px] font-medium text-muted">Destino</span><select name="destination" defaultValue={destination} className="min-h-12 rounded-[16px] bg-bg px-4 text-[15px] outline-none hairline"><option value="">Todo Quintana Roo</option>{DESTINATIONS.map(d=><option key={d.name} value={d.name}>{d.name}</option>)}</select></label>
        <label className="grid gap-1.5"><span className="px-1 text-[11px] font-medium text-muted">Llegada</span><input name="checkIn" type="date" min={today} defaultValue={q.checkIn} required className="min-h-12 rounded-[16px] bg-bg px-4 text-[15px] outline-none hairline"/></label>
        <label className="grid gap-1.5"><span className="px-1 text-[11px] font-medium text-muted">Salida</span><input name="checkOut" type="date" min={q.checkIn || today} defaultValue={q.checkOut} required className="min-h-12 rounded-[16px] bg-bg px-4 text-[15px] outline-none hairline"/></label>
        <label className="grid gap-1.5"><span className="px-1 text-[11px] font-medium text-muted">Huéspedes</span><input name="guests" type="number" min="1" max="30" defaultValue={guests} className="min-h-12 rounded-[16px] bg-bg px-4 text-[15px] outline-none hairline"/></label>
        <button className="press min-h-12 rounded-[999px] bg-green-950 px-6 text-[15px] font-medium text-ivory">Buscar tiempo</button>
      </form>

      {hasDates ? <Section title={inventory.length ? `${inventory.length} opciones disponibles` : "Sin tiempo disponible para esas fechas"}>
        {inventory.length ? <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{inventory.map(inv=><li key={inv.id}><Link href={`/book/stay/${inv.id}?checkIn=${q.checkIn}&checkOut=${q.checkOut}&guests=${guests}`} className="press group block"><div className="relative">{inv.property.cover?<Photo src={inv.property.cover.url} alt={inv.property.cover.alt} ratio="4/3" sizes="(max-width:768px) 100vw,33vw"/>:<div className="aspect-[4/3] rounded-[var(--radius-card)] bg-surface-2"/>}{inv.guaranteeEligible?<span className="absolute left-3 top-3 rounded-full bg-white/88 px-3 py-1 text-[11px] font-medium text-[#07394b] backdrop-blur">Garantía All Living</span>:null}</div><div className="mt-3 flex items-start justify-between gap-3"><div><h2 className="font-serif text-[21px] leading-tight">{inv.property.name}</h2><p className="mt-1 text-sm text-text-2">{inv.property.destination} · {formatRange(q.checkIn!,q.checkOut!)}</p></div><div className="shrink-0 text-right"><p className="text-[15px] font-medium">{inv.nightlyRate?money(inv.nightlyRate,inv.currency):"Consultar"}</p>{inv.nightlyRate?<p className="text-[11px] text-muted">por noche</p>:null}</div></div></Link></li>)}</ul> : <div className="rounded-[26px] bg-surface hairline p-6"><p className="text-[17px]">Todavía no hay inventario cargado para esa combinación.</p><p className="mt-1 text-sm text-text-2">Prueba otras fechas o destino. El motor ya está listo para recibir semanas fractional, propiedades administradas y partners.</p></div>}
      </Section> : <>
        <Section title="Tres maneras de vivir el Caribe"><ul className="destination-stories">{DESTINATIONS.map((d,i)=><li key={d.slug} className={i===0?"destination-story is-wide":"destination-story"}><Link href={`/explore/${d.slug}`}><Photo src={d.photo} alt={d.name} ratio={i===0?"16/9":"4/5"} sizes={i===0?"(max-width:768px) 100vw,50vw":"(max-width:768px) 50vw,25vw"}/><span className="destination-story-shade"/><span className="destination-story-copy"><strong>{d.name}</strong><small>{d.tags}</small></span></Link></li>)}</ul></Section>
        {(() => {
          const visibles = properties.filter(p=>["Cancún","Playa del Carmen","Tulum"].includes(p.destination));
          return <Section title="Propiedades para vivir">
            {visibles.length
              ? <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">{visibles.map(p=><li key={p.id}><PhotoTile href={`/properties/${p.id}`} src={p.cover?.url??null} alt={p.cover?.alt??p.name} title={p.name} subtitle={`${p.destination}${p.bedrooms?` · ${p.bedrooms} rec.`:""}`} badge={p.isDemo?<Chip>Demo</Chip>:undefined}/></li>)}</ul>
              : <EmptyState title="Abrimos en Quintana Roo" body="Cancún, Playa del Carmen y Tulum. Estamos cargando las primeras propiedades: en cuanto haya tiempo disponible aparece aquí." cta={{ href: "/sign-up", label: "Avísame cuando abra" }} />}
          </Section>;
        })()}
      </>}
    </Page>
  );
}
