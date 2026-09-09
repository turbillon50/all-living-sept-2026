import { redirect } from "next/navigation";
import { requireUser } from "@/domains/identity/current-user";
import { providerForUser } from "@/domains/providers/queries";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { ProviderForm } from "./provider-form";

export const dynamic = "force-dynamic";

/** Pantalla 38: onboarding de proveedor. */
export default async function ProOnboarding() {
  const user = await requireUser();
  const existing = await providerForUser(user.id);
  if (existing && existing.status !== "draft" && existing.status !== "rejected") redirect("/pro/verification");
  return (
    <Page>
      <TopBar back="/profile/mode" title="Trabajar con All Living" />
      <header className="pt-4 fade-up"><h1 className="text-[32px] leading-[1.06]">Quiero trabajar con All Living</h1><p className="mt-2 text-text-2">Cuéntanos qué haces y dónde. Revisamos tu perfil y te avisamos. Nada se publica solo.</p></header>
      <ProviderForm defaults={existing ? { kind: existing.kind, businessName: existing.businessName, primaryCategory: existing.primaryCategory, description: existing.description ?? "", contactPhone: existing.contactPhone ?? "", contactEmail: existing.contactEmail ?? user.email } : { kind: "person", businessName: "", primaryCategory: "concierge", description: "", contactPhone: "", contactEmail: user.email }} />
    </Page>
  );
}
