import { and, asc, eq, gte, lt } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { requireRole } from "@/domains/identity/current-user";
import { money, firstName } from "@/core/format";
import { Page } from "@/ui/page";
import { Chip } from "@/ui/chip";
import { EmptyState } from "@/ui/empty-state";
import { BrandPanel, ListRow, RowGroup } from "@/ui/primitives";
import { Mark } from "@/ui/mark";
import { ButtonLink } from "@/ui/button";
import Image from "next/image";
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
  // Solo lo aceptado cuenta como confirmado; lo solicitado se dice aparte. Nunca se suman.
  const CONFIRMED = new Set(["confirmed", "payment_pending", "paid", "in_progress", "completed"]);
  const confirmed = today.filter((r) => CONFIRMED.has(r.b.status));
  const requested = today.filter((r) => r.b.status === "requested" || r.b.status === "pending_provider").length;
  const confirmedTotal = confirmed.reduce((s, r) => s + Number(r.b.total), 0);
  const fmtTime = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" });

  return (
    <Page>
      <BrandPanel className="pb-7 md:mt-6">
        <div className="flex flex-col items-center pt-8 text-center">
          <Mark size={30} onDark />
          <p className="mt-3 font-serif text-[22px] tracking-[0.3em] uppercase leading-none">All Living</p>
          <p className="mt-1.5 text-[9px] tracking-[0.4em] uppercase text-ivory/60">Provider</p>
          <span className="relative mt-5 size-16 overflow-hidden rounded-full bg-ivory/10 ring-2 ring-ivory/30">{user.avatarUrl ? <Image src={user.avatarUrl} alt="" fill sizes="64px" className="object-cover" /> : prov.logoUrl ? <Image src={prov.logoUrl} alt="" fill sizes="64px" className="object-cover" /> : null}</span>
          <p className="mt-3 font-medium">{prov.businessName}</p>
          <p className="text-[12px] text-ivory/70">{prov.status === "approved" ? "All Living Verified" : prov.status}{prov.isDemo ? " · demo" : ""}</p>
        </div>
      </BrandPanel>
      <header className="mt-7 fade-up">
        <p className="text-[11px] tracking-[0.28em] uppercase text-muted">{new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "short" }).format(new Date())}</p>
        <h1 className="mt-1 text-[28px] leading-[1.08]">Hoy</h1>
        <p className="mt-1 text-[16px] text-text-2">{today.length} {today.length === 1 ? "servicio" : "servicios"}{confirmed.length ? ` · ${money(confirmedTotal)} confirmados` : ""}{requested ? ` · ${requested} por confirmar` : ""}</p>
      </header>
      <section className="mt-5">
        {today.length === 0 ? (
          <EmptyState title="Sin servicios para hoy." cta={{ href: "/pro/jobs", label: "Ver agenda" }} />
        ) : (
          <RowGroup>
            {today.map(({ b, service, property, city }) => {
              const st = BOOKING_STATUS[b.status] ?? { label: b.status, tone: "neutral" as const };
              return <ListRow key={b.id} href={`/pro/jobs/${b.id}`} title={`${fmtTime.format(b.scheduledAt)} · ${service}`} subtitle={property ? `${property} · ${city}` : "Sin propiedad"} right={<Chip tone={st.tone}>{st.label}</Chip>} />;
            })}
          </RowGroup>
        )}
        <div className="mt-5"><ButtonLink href="/pro/jobs" size="lg">Ver agenda completa</ButtonLink></div>
      </section>
    </Page>
  );
}
