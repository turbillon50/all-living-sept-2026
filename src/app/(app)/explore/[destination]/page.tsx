import { notFound } from "next/navigation";
import Link from "next/link";
import { activeProperties } from "@/domains/properties/queries";
import { providersByCategory } from "@/domains/services/queries";
import { ProviderCard } from "@/domains/services/provider-card";
import { Page, Section } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Photo } from "@/ui/photo";

const DESTINATIONS: Record<string, { name: string; photo: string; intro: string; tags: string[] }> = {
  tulum: { name: "Tulum", photo: "/demo/tulum-sea.webp", intro: "Selva, mar y silencio. Cenotes por la mañana, yate por la tarde, chef por la noche.", tags: ["Playa", "Gastronomía", "Wellness"] },
  "valle-de-bravo": { name: "Valle de Bravo", photo: "/demo/mountain.webp", intro: "Niebla, lago y chimenea. Para bajar el ritmo.", tags: ["Montaña", "Aventura"] },
  "ciudad-de-mexico": { name: "Ciudad de México", photo: "/demo/city.webp", intro: "Cultura, mesas y noches largas.", tags: ["Ciudad", "Cultura", "Gastronomía"] },
};

export const dynamic = "force-dynamic";

/** Pantalla 28: destino. Editorial, no catálogo. */
export default async function DestinationPage({ params }: { params: Promise<{ destination: string }> }) {
  const { destination } = await params;
  const d = DESTINATIONS[destination];
  if (!d) notFound();
  const [properties, yachts, chefs, wellness] = await Promise.all([
    activeProperties().then((ps) => ps.filter((p) => p.destination === d.name)),
    providersByCategory("yachts", d.name),
    providersByCategory("chefs", d.name),
    providersByCategory("wellness", d.name),
  ]);
  const experiences = [...yachts, ...chefs, ...wellness].slice(0, 6);
  return (
    <Page wide>
      <TopBar back="/explore" title={d.name} />
      <Photo src={d.photo} alt={d.name} priority ratio="16/9" className="mt-2" sizes="(max-width: 768px) 100vw, 1152px" />
      <header className="mt-6"><h1 className="text-[36px] leading-[1.04] md:text-[48px]">{d.name}</h1><p className="mt-3 max-w-prose text-[17px] text-text-2">{d.intro}</p><p className="mt-2 text-sm text-muted">{d.tags.join(" · ")}</p></header>
      {properties.length > 0 ? (
        <Section title="Propiedades para vivir">
          <ul className="grid gap-4 md:grid-cols-2">{properties.map((p) => <li key={p.id}><Link href={`/properties/${p.id}`} className="press block">{p.cover ? <Photo src={p.cover.url} alt={p.cover.alt} sizes="(max-width: 768px) 100vw, 50vw" /> : null}<p className="mt-2 font-serif text-[20px]">{p.name}</p><p className="text-sm text-text-2">{p.bedrooms ? `${p.bedrooms} recámaras` : ""}{p.maxGuests ? ` · hasta ${p.maxGuests}` : ""}</p></Link></li>)}</ul>
        </Section>
      ) : null}
      {experiences.length > 0 ? (
        <Section title="Experiencias" action={<Link href="/services" className="text-sm text-green-900">Todos los servicios</Link>}>
          <ul className="grid gap-5 md:grid-cols-3">{experiences.map((p) => <li key={p.id}><ProviderCard p={p} /></li>)}</ul>
        </Section>
      ) : null}
    </Page>
  );
}
