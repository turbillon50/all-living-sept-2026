import Link from "next/link";
import Image from "next/image";
import { SERVICE_CATEGORIES } from "@/domains/services/categories";
import { Page, PageHeader } from "@/ui/page";

/** Pantalla 29: servicios. Categorías con fotografía, sin catálogo saturado. */
export default function ServicesPage() {
  return (
    <Page wide>
      <PageHeader eyebrow="Servicios" title="Lo que necesites, aquí." description="Concierge, transporte, chefs, yates, wellness y más, con proveedores verificados por All Living." />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {SERVICE_CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Link href={`/services/${c.slug}`} className="press relative block overflow-hidden rounded-[var(--radius-card)] bg-sand-200" style={{ aspectRatio: "4/3" }}>
              <Image src={c.photo} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-green-950/75 via-green-950/10 to-transparent" />
              <span className="absolute bottom-3 left-3 right-3 font-serif text-[18px] text-ivory">{c.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}
