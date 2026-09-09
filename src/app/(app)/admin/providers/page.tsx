import { asc, desc } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { reviewProvider } from "@/domains/admin/actions";
import { Page, PageHeader } from "@/ui/page";
import { AdminNav } from "@/domains/admin/nav";
import { Chip } from "@/ui/chip";
import { Button } from "@/ui/button";

export const dynamic = "force-dynamic";

const TONE: Record<string, "neutral" | "accent" | "success" | "warning" | "danger"> = { draft: "neutral", submitted: "warning", under_review: "accent", approved: "success", rejected: "danger", suspended: "danger" };

export default async function AdminProviders() {
  const provs = await db().query.providers.findMany({ orderBy: [asc(schema.providers.status), desc(schema.providers.createdAt)] });
  return (
    <Page wide>
      <PageHeader eyebrow="Administración" title="Proveedores" />
      <AdminNav current="/admin/providers" />
      <ul className="mt-6 flex flex-col gap-3">
        {provs.map((p) => (
          <li key={p.id} className="rounded-[var(--radius-card)] bg-surface hairline p-4">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-medium">{p.businessName} <span className="text-muted">· {p.primaryCategory}</span></p><p className="text-sm text-text-2 truncate">{p.description}</p><p className="text-[12px] text-muted">{p.contactEmail ?? "sin correo"} · {p.contactPhone ?? "sin tel"}{p.isDemo ? " · demo" : ""}</p></div><Chip tone={TONE[p.status] ?? "neutral"}>{p.status}</Chip></div>
            <form action={reviewProvider} className="mt-3 flex flex-wrap items-center gap-2">
              <input type="hidden" name="providerId" value={p.id} />
              <input name="note" placeholder="Nota (opcional)" className="min-h-10 flex-1 rounded-[var(--radius-ctl)] bg-bg hairline px-3 text-sm" />
              {p.status !== "approved" ? <Button type="submit" name="decision" value="approve" size="sm">Aprobar</Button> : null}
              {p.status === "submitted" ? <Button type="submit" name="decision" value="review" size="sm" variant="secondary">En revisión</Button> : null}
              {p.status !== "rejected" && p.status !== "approved" ? <Button type="submit" name="decision" value="reject" size="sm" variant="secondary">Rechazar</Button> : null}
              {p.status === "approved" ? <Button type="submit" name="decision" value="suspend" size="sm" variant="secondary">Suspender</Button> : null}
            </form>
          </li>
        ))}
      </ul>
    </Page>
  );
}
