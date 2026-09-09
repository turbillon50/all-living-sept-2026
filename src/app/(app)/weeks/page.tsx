import Link from "next/link";
import { requireRole } from "@/domains/identity/current-user";
import { weeksForOwner } from "@/domains/fractions/local-fraction-core";
import { formatRange } from "@/core/format";
import { Page, PageHeader } from "@/ui/page";
import { Chip } from "@/ui/chip";
import { ButtonLink } from "@/ui/button";
import { EmptyState } from "@/ui/empty-state";
import { SEASON_LABEL, WEEK_STATUS } from "@/domains/fractions/labels";

export const dynamic = "force-dynamic";

/** Pantalla 16: Mis semanas. Derechos de uso que vienen de Fraction Core. */
export default async function WeeksPage() {
  const user = await requireRole("owner");
  const rows = await weeksForOwner(user.id);
  return (
    <Page>
      <PageHeader eyebrow="Mis semanas" title="Tus semanas" description="Cada fracción te da sus semanas. Decide si las usas, las rentas o las intercambias." />
      {rows.length === 0 ? (
        <EmptyState title="Aún no tienes semanas." body="Cuando una fracción esté a tu nombre, sus semanas aparecen aquí." />
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map(({ week, fractionCode, propertyName, destination }) => {
            const st = WEEK_STATUS[week.status];
            const primary = week.status === "available" ? { href: `/weeks/${week.id}/use`, label: "Usar" } : { href: `/weeks/${week.id}`, label: "Ver" };
            return (
              <li key={week.id} className="rounded-[var(--radius-card)] bg-surface hairline p-4">
                <p className="text-[11px] tracking-[0.24em] uppercase text-muted">{propertyName} · {destination} · Fracción {fractionCode}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <p className="font-serif text-[24px] leading-tight">{formatRange(week.startDate, week.endDate)}</p>
                    <p className="mt-1 text-sm text-text-2">Semana {SEASON_LABEL[week.season]} · {week.year}</p>
                  </div>
                  <Chip tone={st.tone}>{st.label}</Chip>
                </div>
                <div className="mt-4 flex gap-2">
                  <ButtonLink href={primary.href} size="sm" variant={week.status === "available" ? "primary" : "secondary"}>{primary.label}</ButtonLink>
                  {week.status === "available" ? <ButtonLink href={`/weeks/${week.id}/release`} size="sm" variant="secondary">Rentar</ButtonLink> : null}
                  {week.status === "available" ? <Link href={`/weeks/${week.id}/exchange`} className="press inline-flex min-h-10 items-center px-3 text-sm text-green-900">Intercambiar</Link> : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Page>
  );
}
