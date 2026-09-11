import Link from "next/link";
import { MessageCircle, Siren, Wrench, Sparkles, KeyRound, HelpCircle } from "@/ui/icons";
import { requireUser } from "@/domains/identity/current-user";
import { nextStayFor } from "@/domains/stays/queries";
import { Page, PageHeader } from "@/ui/page";

export const dynamic = "force-dynamic";

/** Pantalla 43: soporte / concierge. Acceso rápido, sobre todo durante la estancia. */
export default async function SupportPage({ searchParams }: { searchParams: Promise<{ stay?: string }> }) {
  const { stay: stayParam } = await searchParams;
  const user = await requireUser();
  const next = await nextStayFor(user.id);
  const stayId = stayParam ?? next?.id ?? null;
  const q = stayId ? `?stay=${stayId}` : "";
  const OPTIONS = [
    { href: `/support/chat${q}`, title: "Chat con concierge", body: "Respuesta humana, 24/7 durante tu estancia.", Icon: MessageCircle },
    { href: `/incidents/new${q}&type=urgencia`, title: "Urgencia operativa", body: "Agua, luz, acceso, seguridad. Prioridad inmediata.", Icon: Siren },
    { href: `/incidents/new${q}&type=propiedad`, title: "Incidencia en la propiedad", body: "Algo no funciona o se dañó.", Icon: Wrench },
    { href: `/services${q}`, title: "Un servicio", body: "Chef, transporte, yate, wellness.", Icon: Sparkles },
    { href: stayId ? `/stays/${stayId}/access` : "/stays", title: "Acceso", body: "Códigos, llegada, reglas de la casa.", Icon: KeyRound },
    { href: `/incidents/new${q}&type=otro`, title: "Otro", body: "Cuéntanos y lo resolvemos.", Icon: HelpCircle },
  ];
  return (
    <Page>
      <PageHeader eyebrow="Soporte" title="¿Qué necesitas?" description={next ? `Estás ${next.status === "in_progress" ? "en" : "por ir a"} ${next.propertyName}. Estamos a un toque.` : "Concierge de All Living."} />
      <ul className="flex flex-col gap-2.5">
        {OPTIONS.map(({ href, title, body, Icon }) => (
          <li key={title}>
            <Link href={href.replace("?stay=&", "?").replace(/\?$/, "")} className="press flex items-center gap-4 rounded-[var(--radius-card)] bg-surface hairline p-4 hover:bg-surface-2">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-green-900"><Icon size={20} aria-hidden /></span>
              <span className="min-w-0"><span className="block font-medium">{title}</span><span className="block text-sm text-text-2">{body}</span></span>
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}
