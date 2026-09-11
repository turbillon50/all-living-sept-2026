import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { EmptyState } from "@/ui/empty-state";

/** Beneficios All Living: catálogo vacío hasta que la casa lo defina. No se inventa nada. */
export default function BenefitsPage() {
  return (
    <Page>
      <TopBar back="/profile" title="Beneficios" />
      <header className="pt-4"><h1 className="text-[30px] leading-[1.06]">Beneficios All Living</h1><p className="mt-2 text-text-2">Traslados, conserjería, experiencias y convenios con aliados.</p></header>
      <div className="mt-8"><EmptyState title="El catálogo de beneficios se está definiendo." body="Cuando la casa lo publique, aquí verás qué incluye tu membresía y cómo canjearlo." /></div>
    </Page>
  );
}
