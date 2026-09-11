import { requireUser } from "@/domains/identity/current-user";
import { providerForUser } from "@/domains/providers/queries";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Chip } from "@/ui/chip";
import { ButtonLink } from "@/ui/button";

export const dynamic = "force-dynamic";

const STEPS: Record<string, { label: string; tone: "neutral" | "accent" | "success" | "warning" | "danger"; body: string }> = {
  draft: { label: "Borrador", tone: "neutral", body: "Todavía no envías tu solicitud." },
  submitted: { label: "Enviada", tone: "accent", body: "Recibimos tu solicitud. Te contactaremos para identificación, documentos y cuenta de pagos." },
  under_review: { label: "En revisión", tone: "warning", body: "Estamos revisando tus documentos." },
  approved: { label: "Aprobado · All Living Verified", tone: "success", body: "Ya apareces en el marketplace y puedes recibir solicitudes." },
  rejected: { label: "No aprobado", tone: "danger", body: "Revisa la nota y vuelve a enviar cuando quieras." },
  suspended: { label: "Suspendido", tone: "danger", body: "Contacta a concierge para reactivar." },
};

/** Pantalla 39: verificación. Estado real del perfil. */
export default async function ProVerification() {
  const user = await requireUser();
  const prov = await providerForUser(user.id);
  const st = STEPS[prov?.status ?? "draft"] ?? STEPS.draft!;
  return (
    <Page>
      <TopBar back="/pro" title="Verificación" />
      <header className="pt-4 fade-up"><h1 className="text-[32px] leading-[1.06]">{prov?.businessName ?? "Tu perfil"}</h1><div className="mt-3"><Chip tone={st.tone}>{st.label}</Chip></div><p className="mt-3 text-text-2">{st.body}</p>{prov?.reviewNote ? <p className="mt-2 text-sm text-text-2">Nota: {prov.reviewNote}</p> : null}</header>
      <ol className="mt-8 flex flex-col gap-2 text-sm">
        {[["Solicitud", true], ["Identificación y documentos", prov?.status === "under_review" || prov?.status === "approved"], ["Datos fiscales y cuenta de pagos", prov?.status === "approved"], ["Aprobación", prov?.status === "approved"]].map(([label, done]) => <li key={String(label)} className="flex items-center justify-between rounded-[var(--radius-card)] bg-surface hairline px-4 py-3"><span>{label}</span><Chip tone={done ? "success" : "neutral"}>{done ? "Listo" : "Pendiente"}</Chip></li>)}
      </ol>
      {!prov || prov.status === "draft" || prov.status === "rejected" ? <div className="mt-8"><ButtonLink href="/pro/onboarding">{prov ? "Volver a enviar" : "Crear perfil"}</ButtonLink></div> : null}
    </Page>
  );
}
