import { notFound } from "next/navigation";
import { categoryBySlug } from "@/domains/services/categories";
import { providersByCategory } from "@/domains/services/queries";
import { ProviderCard } from "@/domains/services/provider-card";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { EmptyState } from "@/ui/empty-state";
import { HeroHeader } from "@/ui/primitives";

export const dynamic = "force-dynamic";
const CATEGORY_HERO: Record<string,string> = { yachts:"/demo/yacht.webp", chefs:"/demo/chef.webp", wellness:"/demo/wellness.webp", transport:"/demo/city.webp", childcare:"/demo/villa-interior.webp", concierge:"/demo/villa-pool.webp" };

/** Pantalla 30: categoría de servicio. Proveedores verificados, sin ratings inventados. */
export default async function CategoryPage({ params, searchParams }: { params: Promise<{ category: string }>; searchParams: Promise<{ stay?: string; d?: string }> }) {
  const { category } = await params;
  const { stay, d } = await searchParams;
  const cat = categoryBySlug(category);
  if (!cat) notFound();
  const providers = await providersByCategory(cat.slug, d);
  return (
    <Page wide>
      <TopBar back="/services" title={cat.label} />
      <HeroHeader src={CATEGORY_HERO[cat.slug] ?? "/demo/tulum-sea.webp"} alt={cat.label} eyebrow="VIVIR" title={cat.label} subtitle="Suma lo que necesitas a tu estancia." height="min-h-[330px] md:min-h-[430px]" />
      <section className="mt-6">
        {providers.length === 0 ? (
          <EmptyState title={`Todavía no hay proveedores de ${cat.label.toLowerCase()} verificados.`} body="Concierge puede conseguirlo por ti mientras tanto." cta={{ href: "/support", label: "Pedir a concierge" }} />
        ) : (
          <ul className="grid gap-5 md:grid-cols-3">{providers.map((p) => <li key={p.id}><ProviderCard p={{ ...p, slug: stay ? `${p.slug}?stay=${stay}` : p.slug }} /></li>)}</ul>
        )}
      </section>
    </Page>
  );
}
