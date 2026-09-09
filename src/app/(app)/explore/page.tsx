import Link from "next/link";
import { activeProperties } from "@/domains/properties/queries";
import { Page, PageHeader, Section } from "@/ui/page";
import { Photo } from "@/ui/photo";
import { Chip } from "@/ui/chip";

const FILTERS = ["Todos", "Playa", "Montaña", "Ciudad", "Wellness", "Gastronomía", "Aventura"];
const DESTINATIONS = [
  { slug: "tulum", name: "Tulum", tone: "Playa", photo: "/demo/tulum-sea.webp" },
  { slug: "valle-de-bravo", name: "Valle de Bravo", tone: "Montaña", photo: "/demo/mountain.webp" },
  { slug: "ciudad-de-mexico", name: "Ciudad de México", tone: "Ciudad", photo: "/demo/city.webp" },
];

export const dynamic = "force-dynamic";

/** Pantalla 27: Explore. Destinos, experiencias, propiedades utilizables e inspiración. No es catálogo inmobiliario. */
export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f = "Todos" } = await searchParams;
  const properties = await activeProperties();
  const destinations = f === "Todos" ? DESTINATIONS : DESTINATIONS.filter((d) => d.tone === f);
  return (
    <Page wide>
      <PageHeader eyebrow="Explorar" title="¿A dónde te lleva la próxima?" />
      <ul className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
        {FILTERS.map((x) => (
          <li key={x} className="shrink-0">
            <Link href={x === "Todos" ? "/explore" : `/explore?f=${encodeURIComponent(x)}`} className={`inline-flex min-h-10 items-center rounded-[var(--radius-pill)] px-4 text-sm hairline ${x === f ? "bg-accent text-on-accent border-accent" : "bg-surface"}`}>
              {x}
            </Link>
          </li>
        ))}
      </ul>
      <Section title="Destinos">
        <ul className="grid gap-4 md:grid-cols-3">
          {destinations.map((d) => (
            <li key={d.slug}>
              <Link href={`/explore/${d.slug}`} className="press block">
                <Photo src={d.photo} alt={d.name} ratio="4/5" sizes="(max-width: 768px) 100vw, 33vw" />
                <p className="mt-2 font-serif text-[20px]">{d.name}</p>
                <p className="text-sm text-text-2">{d.tone}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Propiedades para vivir">
        <ul className="grid gap-4 md:grid-cols-2">
          {properties.map((p) => (
            <li key={p.id}>
              <Link href={`/properties/${p.id}`} className="press block">
                {p.cover ? <Photo src={p.cover.url} alt={p.cover.alt} sizes="(max-width: 768px) 100vw, 50vw" /> : null}
                <div className="mt-2 flex items-center justify-between">
                  <div><p className="font-serif text-[20px]">{p.name}</p><p className="text-sm text-text-2">{p.destination}{p.bedrooms ? ` · ${p.bedrooms} rec.` : ""}</p></div>
                  {p.isDemo ? <Chip>Demo</Chip> : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </Page>
  );
}
