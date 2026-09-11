import Link from "next/link";
import { requireRole } from "@/domains/identity/current-user";
import { activeProperties } from "@/domains/properties/queries";
import { Page, PageHeader } from "@/ui/page";
import { Photo } from "@/ui/photo";

export const dynamic = "force-dynamic";

export default async function OpsProperties() {
  await requireRole("operator");
  const props = await activeProperties();
  return (
    <Page wide>
      <PageHeader eyebrow="Operación" title="Propiedades" />
      <ul className="grid gap-4 md:grid-cols-3">{props.map((p) => <li key={p.id}><Link href={`/ops/properties/${p.id}`} className="press block">{p.cover ? <Photo src={p.cover.url} alt={p.cover.alt} sizes="(max-width: 768px) 100vw, 33vw" /> : null}<p className="mt-2 font-serif text-[20px]">{p.name}</p><p className="text-sm text-text-2">{p.destination}</p></Link></li>)}</ul>
    </Page>
  );
}
