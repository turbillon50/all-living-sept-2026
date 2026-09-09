import Link from "next/link";
import { requireUser } from "@/domains/identity/current-user";
import { fractionCore } from "@/domains/fractions/local-fraction-core";
import { staysForUser } from "@/domains/stays/queries";
import { coverFor } from "@/domains/properties/queries";
import { issueQr } from "@/domains/identity/pass";
import { formatRange } from "@/core/format";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Chip } from "@/ui/chip";
import { RingMark } from "@/ui/ring";
import { PhotoTile, Segmented } from "@/ui/primitives";

export const dynamic = "force-dynamic";

/** Pantalla 34: LIVING PASS. Tarjeta verde con el aro, QR temporal firmado, propiedades y accesos. */
export default async function PassPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t = "properties" } = await searchParams;
  const user = await requireUser();
  const [ownerships, stays] = await Promise.all([fractionCore().getUserOwnerships(user.id), staysForUser(user.id)]);
  const covers = await coverFor([...new Set(ownerships.map((o) => o.propertyId))]);
  const { svg } = await issueQr({ userId: user.id, kind: "living_pass", memberId: user.memberId, ttlSeconds: 60 * 10 });
  const upcoming = stays.filter((s) => s.status !== "completed");
  return (
    <Page>
      <TopBar back="/profile" title="Living Pass" />
      <section className="mt-3 rounded-[var(--radius-panel)] bg-green-950 p-6 text-ivory shadow-[var(--shadow-float)] fade-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><RingMark size={34} onDark /><div><p className="font-serif text-[18px] tracking-[0.26em] uppercase leading-none">All Living</p><p className="mt-1 text-[9px] tracking-[0.36em] uppercase text-ivory/60">Pass</p></div></div>
        </div>
        <div className="mt-6 flex items-center gap-5">
          <div className="min-w-0 flex-1">
            <p className="font-serif text-[24px] leading-tight truncate">{user.name}</p>
            <p className="mt-1 text-[12px] tracking-[0.18em] text-ivory/70">{user.memberId}</p>
            <p className="mt-3 text-[11px] text-ivory/55">Código temporal · se renueva cada 10 min · sin datos personales</p>
          </div>
          <div className="w-[104px] shrink-0 rounded-[14px] bg-ivory p-2.5 [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
      </section>
      <div className="mt-6"><Segmented current={t} items={[{ key: "properties", label: "Propiedades", href: "/pass" }, { key: "services", label: "Servicios", href: "/pass?t=services" }, { key: "benefits", label: "Beneficios", href: "/pass?t=benefits" }]} /></div>
      <div className="mt-5">
        {t === "properties" ? (
          ownerships.length === 0 ? <p className="text-sm text-text-2">Sin propiedades a tu nombre.</p> : <ul className="grid grid-cols-2 gap-4">{ownerships.map((o) => <li key={o.id}><PhotoTile href={`/properties/${o.propertyId}`} src={covers.get(o.propertyId)?.url ?? null} alt={o.propertyName} title={`${o.destination} · ${o.propertyName}`} subtitle={`Fracción ${o.fractionCode}`} /></li>)}</ul>
        ) : t === "services" ? (
          upcoming.length === 0 ? <p className="text-sm text-text-2">Sin accesos activos.</p> : <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline">{upcoming.map((s) => <li key={s.id} className="flex items-center justify-between px-4 py-3 text-sm"><Link href={`/stays/${s.id}/access`}>{s.propertyName} · {formatRange(s.startDate, s.endDate)}</Link><Chip tone={s.status === "in_progress" ? "success" : "neutral"}>{s.status === "in_progress" ? "Activo" : "Próximo"}</Chip></li>)}</ul>
        ) : (
          <p className="text-sm text-text-2">Los beneficios de tu membresía aparecen aquí cuando la casa publique el catálogo. <Link href="/profile/benefits" className="text-green-900 underline underline-offset-4">Saber más</Link></p>
        )}
      </div>
    </Page>
  );
}
