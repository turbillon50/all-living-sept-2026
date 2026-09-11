import Link from "next/link";
import { Star, Ship, ChefHat, Baby, Car, HeartPulse, ConciergeBell } from "@/ui/icons";
import { SERVICE_CATEGORIES } from "@/domains/services/categories";
import { providersByCategory } from "@/domains/services/queries";
import { Page, PageHeader, Section } from "@/ui/page";
import { IconTile, PhotoTile, SearchBar } from "@/ui/primitives";

export const dynamic = "force-dynamic";

const TOP = [
  { slug: "featured", label: "Destacados", Icon: Star, href: "/services" },
  { slug: "yachts", label: "Yates", Icon: Ship, href: "/services/yachts" },
  { slug: "chefs", label: "Chefs", Icon: ChefHat, href: "/services/chefs" },
  { slug: "childcare", label: "Niñeras", Icon: Baby, href: "/services/childcare" },
];
const MORE = [{ slug: "transport", Icon: Car }, { slug: "wellness", Icon: HeartPulse }, { slug: "concierge", Icon: ConciergeBell }];

/** Pantalla 29: Servicios. Buscador, tiles de categoría, destacados con fotografía. */
export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ stay?: string; q?: string }> }) {
  const { stay, q } = await searchParams;
  const suffix = stay ? `?stay=${stay}` : "";
  const [yachts, chefs, transport, wellness] = await Promise.all([providersByCategory("yachts"), providersByCategory("chefs"), providersByCategory("transport"), providersByCategory("wellness")]);
  const featured = [...yachts, ...chefs, ...transport, ...wellness].filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.category.includes(q.toLowerCase())).slice(0, 6);
  const labelOf = (slug: string) => SERVICE_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
  return (
    <Page wide>
      <PageHeader eyebrow="Servicios" title="Servicios" />
      <SearchBar placeholder="¿Qué necesitas para tu estancia?" action="/services" defaultValue={q} />
      <ul className="mt-5 grid grid-cols-4 gap-2.5 md:grid-cols-7">
        {TOP.map((t) => <li key={t.slug}><IconTile href={`${t.href}${suffix}`} label={t.label} Icon={t.Icon} active={t.slug === "featured" && !q} /></li>)}
        {MORE.map((m) => <li key={m.slug} className="hidden md:block"><IconTile href={`/services/${m.slug}${suffix}`} label={labelOf(m.slug)} Icon={m.Icon} /></li>)}
      </ul>
      <Section title="Servicios destacados" action={<Link href="/services/all" className="text-sm text-green-900">Ver todos</Link>}>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {featured.map((p) => <li key={p.id}><PhotoTile href={`/providers/${p.slug}${suffix}`} src={p.cover} alt={p.name} title={p.name} subtitle={`${labelOf(p.category)}${p.areas[0] ? ` en ${p.areas[0]}` : ""}`} /></li>)}
        </ul>
      </Section>
    </Page>
  );
}
