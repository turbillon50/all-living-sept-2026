import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/domains/identity/current-user";
import { stayById } from "@/domains/stays/queries";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { InviteForm } from "./invite-form";

export const dynamic = "force-dynamic";

/** Pantalla 26: invitar. Crea la liga; si no tiene cuenta, onboarding mínimo → estancia. */
export default async function InvitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const stay = await stayById(id);
  if (!stay || stay.hostUserId !== user.id) notFound();
  if (stay.status === "completed" || stay.status === "cancelled") redirect(`/stays/${stay.id}/guests`);
  return (
    <Page>
      <TopBar back={`/stays/${stay.id}/guests`} title="Invitar" />
      <header className="pt-4 fade-up">
        <h1 className="text-[32px] leading-[1.06]">Invita a alguien a tu estancia</h1>
        <p className="mt-2 text-text-2">Le mandamos una liga. Si no tiene cuenta, la crea en un minuto y aterriza directo en la estancia.</p>
      </header>
      <InviteForm stayId={stay.id} />
    </Page>
  );
}
