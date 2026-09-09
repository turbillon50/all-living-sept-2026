import { activeProperties } from "@/domains/properties/queries";
import { Page, PageHeader, Section } from "@/ui/page";
import { Chip } from "@/ui/chip";
import { FilterPills, PhotoTile, SearchBar } from "@/ui/primitives";

const FILTERS = ["Todos", "Playa", "Montaña", "Ciudad", "Wellness", "Gastronomía", "Aventura"];
const DESTINATIONS = [
  { slug: "tulum", name: "Tulum", tone: "Playa", tags: "Casas · Experiencias", photo: "/demo/tulum-sea.webp" },
  { slug: "los-cabos", name: "Los Cabos", tone: "Playa", tags: "Mar · Golf · Lujo", photo: "/demo/yacht.webp" },
  { slug: "valle-de-bravo", name: "Valle de Bravo", tone: "Montaña", tags: "Naturaleza · Relax", photo: "/demo/mountain.webp" },
  { slug: "ciudad-de-mexico", name: "Ciudad de México", tone: "Ciudad", tags: "Cultura · Gastronomía", photo: "/demo/city.webp" },
];

export const dynamic = "force-dynamic";

/** Pantalla 27: Explorar. Buscador, filtros, destinos en grid de dos. No es catálogo inmobiliario. */
export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ f?: string; q?: string }> }) {
  const { f = "Todos", q = "" } = await searchParams;
  const properties = await activeProperties();
  const dests = DESTINATIONS.filter((d) => (f === "Todos" || d.tone === f) && (!q || d.name.toLowerCase().includes(q.toLowerCase())));
  return (
    <Page wide>
      <PageHeader eyebrow="Explorar" title="Explorar" />
      <SearchBar placeholder="¿A dónde te gustaría ir?" action="/explore" defaultValue={q} />
      <FilterPills className="mt-4" current={f} items={FILTERS.map((x) => ({ key: x, label: x, href: x === "Todos" ? "/explore" : `/explore?f=${encodeURIComponent(x)}` }))} />
      <Section>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">{dests.map((d) => <li key={d.slug}><PhotoTile href={`/explore/${d.slug}`} src={d.photo} alt={d.name} title={d.name} subtitle={d.tags} /></li>)}</ul>
      </Section>
      <Section title="Propiedades para vivir">
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">{properties.map((p) => <li key={p.id}><PhotoTile href={`/properties/${p.id}`} src={p.cover?.url ?? null} alt={p.cover?.alt ?? p.name} title={p.name} subtitle={`${p.destination}${p.bedrooms ? ` · ${p.bedrooms} rec.` : ""}`} badge={p.isDemo ? <Chip>Demo</Chip> : undefined} /></li>)}</ul>
      </Section>
    </Page>
  );
}
