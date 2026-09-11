import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "@/ui/icons";
import { requireUser } from "@/domains/identity/current-user";
import { fractionCore } from "@/domains/fractions/local-fraction-core";
import { coverFor } from "@/domains/properties/queries";
import { Page, PageHeader } from "@/ui/page";
import { EmptyState } from "@/ui/empty-state";
import { Chip } from "@/ui/chip";
import { ButtonLink } from "@/ui/button";
import { Segmented } from "@/ui/primitives";

export const dynamic = "force-dynamic";

/** Pantalla 12/14: mis propiedades. Control segmentado y filas con miniatura. */
export default async function PropertiesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "properties" } = await searchParams;
  const user = await requireUser();
  const ownerships = await fractionCore().getUserOwnerships(user.id);
  const covers = await coverFor([...new Set(ownerships.map((o) => o.propertyId))]);
  const byProperty = new Map<string, typeof ownerships>();
  for (const o of ownerships) byProperty.set(o.propertyId, [...(byProperty.get(o.propertyId) ?? []), o]);

  return (
    <Page>
      <PageHeader eyebrow="Mis propiedades" title="Mis propiedades" />
      <Segmented current={tab} items={[{ key: "properties", label: "Propiedades", href: "/properties" }, { key: "fractions", label: "Fracciones", href: "/properties?tab=fractions" }]} />
      <div className="mt-6">
        {ownerships.length === 0 ? (
          <EmptyState title="Aún no hay propiedades a tu nombre." body="Cuando adquieras una fracción en V&LIVING, aparece aquí lista para vivirla." />
        ) : (
          <ul className="flex flex-col gap-3">
            {(tab === "fractions"
              ? ownerships.map((o) => ({ key: o.id, href: `/fractions/${o.fractionId}`, cover: covers.get(o.propertyId), title: `${o.destination} · ${o.propertyName}`, sub: `Fracción ${o.fractionCode}`, meta: "3 semanas al año", chip: "Activa" }))
              : [...byProperty.entries()].map(([pid, list]) => ({ key: pid, href: `/properties/${pid}`, cover: covers.get(pid), title: `${list[0]!.destination} · ${list[0]!.propertyName}`, sub: list.map((o) => `Fracción ${o.fractionCode}`).join(", "), meta: `${list.length * 3} semanas al año`, chip: null }))
            ).map((r) => (
              <li key={r.key}>
                <Link href={r.href} className="press flex items-center gap-4 rounded-[var(--radius-card)] bg-surface hairline p-3 hover:bg-surface-2">
                  <span className="relative size-20 shrink-0 overflow-hidden rounded-[14px] bg-sand-200">{r.cover ? <Image src={r.cover.url} alt="" fill sizes="80px" className="object-cover" /> : null}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium truncate">{r.title}</span>
                    <span className="block text-[13px] text-text-2 truncate">{r.sub}</span>
                    <span className="block text-[12px] text-muted">{r.meta}</span>
                  </span>
                  {r.chip ? <Chip tone="accent">{r.chip}</Chip> : <ChevronRight size={18} className="text-muted" aria-hidden />}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-8"><ButtonLink href="/explore" size="lg">Explorar más propiedades</ButtonLink></div>
    </Page>
  );
}
