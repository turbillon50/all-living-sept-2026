import Link from "next/link";
import { and, asc, eq, gte, lt } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { requireRole } from "@/domains/identity/current-user";
import { money, firstName } from "@/core/format";
import { Page } from "@/ui/page";
import { Chip } from "@/ui/chip";
import { EmptyState } from "@/ui/empty-state";
import { BOOKING_STATUS } from "@/domains/bookings/labels";

export const dynamic = "force-dynamic";

/** Pantalla 11: Provider Home. Hoy, en una mirada. */
export default async function ProHome() {
  const user = await requireRole("provider");
  const d = db();
  const providers = await d.query.providers.findMany({ where: eq(schema.providers.userId, user.id) });
  const prov = providers[0];
  if (!prov) {
    return (
      <Page>
        <header className="pt-10"><h1 className="text-[34px] leading-[1.06]">Hola, {firstName(user.name)}.</h1></header>
        <div className="mt-8"><EmptyState title="Aún no tienes perfil de proveedor." body="Cuéntanos qué ofreces y en dónde. Lo revisamos y te avisamos." cta={{ href: "/pro/onboarding", label: "Quiero trabajar con All Living" }} /></div>
      </Page>
    );
  }
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  const today = await d
    .select({ b: schema.serviceBookings, service: schema.providerServices.name, property: schema.properties.name, city: schema.properties.city })
    .from(schema.serviceBookings)
    .innerJoin(schema.providerServices, eq(schema.providerServices.id, schema.serviceBookings.serviceId))
    .leftJoin(schema.properties, eq(schema.properties.id, schema.serviceBookings.propertyId))
    .where(and(eq(schema.serviceBookings.providerId, prov.id), gte(schema.serviceBookings.scheduledAt, start), lt(schema.serviceBookings.scheduledAt, end)))
    .orderBy(asc(schema.serviceBookings.scheduledAt));
  const total = today.filter((r) => r.b.status !== "cancelled").reduce((s, r) => s + Number(r.b.total), 0);
  const fmtTime = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" });

  return (
    <Page>
      <header className="pt-10 md:pt-14 fade-up">
        <p className="text-[11px] tracking-[0.28em] uppercase text-muted">{prov.businessName}{prov.status === "approved" ? " · Verified" : ` · ${prov.status}`}</p>
        <h1 className="mt-2 text-[34px] leading-[1.06]">Hoy</h1>
        <p className="mt-2 text-[17px] text-text-2">{today.length} {today.length === 1 ? "servicio" : "servicios"} · {money(total)}{prov.isDemo ? " · demo" : ""}</p>
      </header>
      <section className="mt-8">
        {today.length === 0 ? (
          <EmptyState title="Sin servicios para hoy." cta={{ href: "/pro/jobs", label: "Ver agenda" }} />
        ) : (
          <ul className="flex flex-col gap-2.5">
            {today.map(({ b, service, property, city }) => {
              const st = BOOKING_STATUS[b.status] ?? { label: b.status, tone: "neutral" as const };
              return (
                <li key={b.id}>
                  <Link href={`/pro/jobs/${b.id}`} className="press flex items-center gap-4 rounded-[var(--radius-card)] bg-surface hairline p-4 hover:bg-surface-2">
                    <span className="w-12 shrink-0 font-serif text-[18px]">{fmtTime.format(b.scheduledAt)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium truncate">{service}</span>
                      <span className="block text-sm text-text-2 truncate">{property ? `${property} · ${city}` : "Sin propiedad"}</span>
                    </span>
                    <Chip tone={st.tone}>{st.label}</Chip>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </Page>
  );
}
