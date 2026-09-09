import { requireRole } from "@/domains/identity/current-user";
import { weeksForOwner } from "@/domains/fractions/local-fraction-core";
import { formatRange } from "@/core/format";
import { Page, PageHeader } from "@/ui/page";
import { Chip } from "@/ui/chip";
import { ButtonLink } from "@/ui/button";
import { EmptyState } from "@/ui/empty-state";
import { Segmented } from "@/ui/primitives";
import { SEASON_LABEL, WEEK_STATUS } from "@/domains/fractions/labels";

export const dynamic = "force-dynamic";

/** Pantalla 16: Mis semanas. Filas: fechas, temporada, estado y una acción. */
export default async function WeeksPage({ searchParams }: { searchParams: Promise<{ v?: string; intent?: string }> }) {
  const { v = "list" } = await searchParams;
  const user = await requireRole("owner");
  const rows = await weeksForOwner(user.id);
  const groups = new Map<string, typeof rows>();
  for (const r of rows) { const k = `${r.destination} · ${r.propertyName}|${r.fractionCode}`; groups.set(k, [...(groups.get(k) ?? []), r]); }
  const available = rows.find((r) => r.week.status === "available");
  return (
    <Page>
      <PageHeader eyebrow="Mis semanas" title="Mis semanas" />
      <Segmented current={v} items={[{ key: "list", label: "Lista", href: "/weeks" }, { key: "release", label: "Liberar / Rentar", href: "/weeks?v=release" }]} />
      {rows.length === 0 ? (
        <div className="mt-6"><EmptyState title="Aún no tienes semanas." body="Cuando una fracción esté a tu nombre, sus semanas aparecen aquí." /></div>
      ) : (
        [...groups.entries()].map(([k, list]) => {
          const [prop, code] = k.split("|");
          const shown = v === "release" ? list.filter((r) => r.week.status === "available" || r.week.status === "released_for_rent" || r.week.status === "listed" || r.week.status === "booked") : list;
          return (
            <section key={k} className="mt-7">
              <h2 className="text-[19px]">{prop}</h2>
              <p className="text-[13px] text-text-2">Fracción {code}</p>
              <ul className="mt-3 divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline">
                {shown.map(({ week }) => {
                  const st = WEEK_STATUS[week.status];
                  const action = week.status === "available" ? (v === "release" ? { href: `/weeks/${week.id}/release`, label: "Rentar", variant: "secondary" as const } : { href: `/weeks/${week.id}/use`, label: "Usar", variant: "primary" as const }) : { href: `/weeks/${week.id}`, label: "Ver", variant: "secondary" as const };
                  return (
                    <li key={week.id} className="flex items-center gap-3 px-4 py-3.5">
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-medium">{formatRange(week.startDate, week.endDate)} {week.year}</span>
                        <span className="block text-[13px] text-text-2">Semana {SEASON_LABEL[week.season]}</span>
                      </span>
                      <Chip tone={st.tone}>{st.label}</Chip>
                      <ButtonLink href={action.href} size="sm" variant={action.variant}>{action.label}</ButtonLink>
                    </li>
                  );
                })}
                {shown.length === 0 ? <li className="px-4 py-3 text-sm text-text-2">Nada que liberar por ahora.</li> : null}
              </ul>
            </section>
          );
        })
      )}
      {available ? (
        <div className="mt-8">
          <p className="mb-3 text-sm text-text-2">¿Quieres liberar una semana? Genera ingresos mientras otros disfrutan tu propiedad.</p>
          <ButtonLink href={`/weeks/${available.week.id}/release`} size="lg">Liberar semana para renta</ButtonLink>
        </div>
      ) : null}
    </Page>
  );
}
