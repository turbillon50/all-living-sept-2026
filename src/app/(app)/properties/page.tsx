import Link from "next/link";
import { requireUser } from "@/domains/identity/current-user";
import { fractionCore } from "@/domains/fractions/local-fraction-core";
import { coverFor } from "@/domains/properties/queries";
import { Page, PageHeader } from "@/ui/page";
import { Photo } from "@/ui/photo";
import { EmptyState } from "@/ui/empty-state";
import { Chip } from "@/ui/chip";

export const dynamic = "force-dynamic";

/** Pantalla 12/14: mis propiedades y fracciones vinculadas a la cuenta. */
export default async function PropertiesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "properties" } = await searchParams;
  const user = await requireUser();
  const ownerships = await fractionCore().getUserOwnerships(user.id);
  const covers = await coverFor([...new Set(ownerships.map((o) => o.propertyId))]);
  const byProperty = new Map<string, typeof ownerships>();
  for (const o of ownerships) byProperty.set(o.propertyId, [...(byProperty.get(o.propertyId) ?? []), o]);

  return (
    <Page>
      <PageHeader eyebrow="Mis propiedades" title="Lo que es tuyo" />
      <div className="flex gap-2">
        {[["properties", "Propiedades"], ["fractions", "Fracciones"]].map(([k, l]) => (
          <Link key={k} href={`/properties?tab=${k}`} className={`inline-flex min-h-10 items-center rounded-[var(--radius-pill)] px-4 text-sm hairline ${tab === k ? "bg-accent text-on-accent border-accent" : "bg-surface"}`} aria-current={tab === k ? "page" : undefined}>{l}</Link>
        ))}
      </div>
      <div className="mt-6">
        {ownerships.length === 0 ? (
          <EmptyState title="Aún no hay propiedades a tu nombre." body="Cuando adquieras una fracción en V&LIVING, aparece aquí lista para vivirla." />
        ) : tab === "fractions" ? (
          <ul className="flex flex-col gap-3">
            {ownerships.map((o) => (
              <li key={o.id}>
                <Link href={`/fractions/${o.fractionId}`} className="press flex items-center gap-4 rounded-[var(--radius-card)] bg-surface hairline p-3 hover:bg-surface-2">
                  {covers.get(o.propertyId) ? <Photo src={covers.get(o.propertyId)!.url} alt="" className="w-20 shrink-0" ratio="1/1" sizes="80px" /> : null}
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-[19px]">Fracción {o.fractionCode}</span>
                    <span className="block text-sm text-text-2">{o.propertyName} · {o.destination}</span>
                  </span>
                  <Chip tone="accent">Activa</Chip>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col gap-5">
            {[...byProperty.entries()].map(([propertyId, list]) => {
              const first = list[0]!;
              const cover = covers.get(propertyId);
              return (
                <li key={propertyId}>
                  <Link href={`/properties/${propertyId}`} className="press block">
                    {cover ? <Photo src={cover.url} alt={cover.alt} sizes="(max-width: 768px) 100vw, 672px" /> : null}
                    <div className="mt-3 flex items-start justify-between">
                      <div>
                        <p className="font-serif text-[22px]">{first.propertyName}</p>
                        <p className="text-sm text-text-2">{first.destination} · {list.map((o) => o.fractionCode).join(", ")}</p>
                      </div>
                      <Chip>{list.length} {list.length === 1 ? "fracción" : "fracciones"}</Chip>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Page>
  );
}
