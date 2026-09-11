import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { requireUser } from "@/domains/identity/current-user";
import { messaging } from "@/integrations/messaging";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { ButtonLink } from "@/ui/button";
import { Chip } from "@/ui/chip";

export const dynamic = "force-dynamic";

/** Chat con concierge (MVP): cada mensaje es una solicitud persistida tipo "concierge"; la conversación en vivo llega con MessagingProvider real. */
export default async function ConciergeChat({ searchParams }: { searchParams: Promise<{ stay?: string }> }) {
  const { stay } = await searchParams;
  const user = await requireUser();
  const mine = await db().query.incidents.findMany({ where: and(eq(schema.incidents.reporterUserId, user.id), eq(schema.incidents.type, "concierge")), orderBy: desc(schema.incidents.createdAt), limit: 20 });
  const m = messaging();
  const fmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return (
    <Page>
      <TopBar back="/support" title="Concierge" />
      <header className="pt-4 fade-up"><h1 className="text-[30px] leading-[1.06]">Estamos aquí.</h1><p className="mt-2 text-text-2">Escríbenos y una persona del equipo te responde. {m.isLocal ? "El chat en vivo y WhatsApp se activan cuando conectemos mensajería; hoy cada mensaje queda registrado y lo atendemos desde operación." : ""}</p></header>
      <div className="mt-6"><ButtonLink href={`/incidents/new?type=concierge${stay ? `&stay=${stay}` : ""}`} size="lg">Escribir a concierge</ButtonLink></div>
      <section className="mt-8">
        <p className="mb-2 text-[11px] tracking-[0.24em] uppercase text-muted">Tus mensajes</p>
        {mine.length === 0 ? <p className="text-sm text-text-2">Aún no has escrito.</p> : (
          <ul className="flex flex-col gap-2">{mine.map((i) => <li key={i.id} className="rounded-[var(--radius-card)] bg-surface hairline p-4 text-sm"><div className="flex items-center justify-between"><span className="text-muted">{fmt.format(i.createdAt)}</span><Chip tone={i.status === "resolved" || i.status === "closed" ? "success" : "warning"}>{i.status === "resolved" || i.status === "closed" ? "Atendido" : "En curso"}</Chip></div><p className="mt-2">{i.description}</p>{i.resolutionNote ? <p className="mt-2 rounded-[var(--radius-ctl)] bg-accent-soft px-3 py-2 text-green-900">{i.resolutionNote}</p> : null}</li>)}</ul>
        )}
      </section>
    </Page>
  );
}
