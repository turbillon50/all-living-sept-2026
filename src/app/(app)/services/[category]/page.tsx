import { notFound } from "next/navigation";
import { categoryBySlug } from "@/domains/services/categories";
import { providersByCategory } from "@/domains/services/queries";
import { ProviderCard } from "@/domains/services/provider-card";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { EmptyState } from "@/ui/empty-state";

export const dynamic = "force-dynamic";

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
      <header className="pt-4 fade-up"><h1 className="text-[32px] leading-[1.06]">{cat.label}</h1><p className="mt-2 text-text-2">Proveedores con el sello All Living Verified. Reservas con confirmación del proveedor.</p></header>
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
