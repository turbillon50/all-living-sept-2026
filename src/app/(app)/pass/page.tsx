import QRCode from "qrcode";
import { requireUser } from "@/domains/identity/current-user";
import { fractionCore } from "@/domains/fractions/local-fraction-core";
import { staysForUser } from "@/domains/stays/queries";
import { accessControl } from "@/integrations/access-control";
import { db, schema } from "@/db/client";
import { createHash } from "node:crypto";
import { formatRange } from "@/core/format";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Chip } from "@/ui/chip";
import { ROLE_LABEL } from "@/core/roles";

export const dynamic = "force-dynamic";

/** Pantalla 34: LIVING PASS. Identidad y acceso. QR temporal firmado, sin datos sensibles. */
export default async function PassPage() {
  const user = await requireUser();
  const [ownerships, stays] = await Promise.all([fractionCore().getUserOwnerships(user.id), staysForUser(user.id)]);
  const ttl = 60 * 10;
  const token = await accessControl().issue({ sub: user.id, kind: "living_pass", memberId: user.memberId }, ttl);
  await db().insert(schema.accessTokens).values({
    userId: user.id,
    kind: "living_pass",
    tokenHash: createHash("sha256").update(token).digest("hex"),
    expiresAt: new Date(Date.now() + ttl * 1000),
  });
  const svg = await QRCode.toString(token, { type: "svg", margin: 0, color: { dark: "#0f3d3a", light: "#0000" }, errorCorrectionLevel: "M" });
  const upcoming = stays.filter((s) => s.status !== "completed").slice(0, 2);

  return (
    <Page>
      <TopBar back="/profile" title="Living Pass" />
      <section className="mt-4 rounded-[var(--radius-panel)] bg-green-950 p-6 text-ivory shadow-[var(--shadow-float)] fade-up">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] tracking-[0.34em] uppercase text-ivory/60">All Living Pass</p>
            <p className="mt-3 font-serif text-[26px] leading-tight">{user.name}</p>
            <p className="mt-1 text-sm text-ivory/70">Member {user.memberId}</p>
          </div>
          <span className="rounded-full border border-ivory/25 px-3 py-1 text-[11px] tracking-[0.2em] uppercase">{ROLE_LABEL[user.activeContext]}</span>
        </div>
        <div className="mt-6 rounded-[var(--radius-card)] bg-ivory p-4">
          <div className="mx-auto aspect-square w-full max-w-[220px] [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="mt-3 text-center text-[12px] text-ink-2">Código temporal · se renueva cada 10 minutos · no contiene datos personales</p>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-[var(--radius-card)] bg-surface hairline p-4"><p className="text-muted">Fracciones</p><p className="mt-1 font-serif text-[24px]">{ownerships.length}</p></div>
        <div className="rounded-[var(--radius-card)] bg-surface hairline p-4"><p className="text-muted">Estancias</p><p className="mt-1 font-serif text-[24px]">{stays.length}</p></div>
      </section>

      {ownerships.length > 0 ? (
        <section className="mt-6"><p className="mb-2 text-[11px] tracking-[0.24em] uppercase text-muted">Propiedades</p>
          <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline">{ownerships.map((o) => <li key={o.id} className="flex items-center justify-between px-4 py-3"><span>{o.propertyName} · {o.destination}</span><Chip tone="accent">{o.fractionCode}</Chip></li>)}</ul>
        </section>
      ) : null}
      {upcoming.length > 0 ? (
        <section className="mt-6"><p className="mb-2 text-[11px] tracking-[0.24em] uppercase text-muted">Accesos</p>
          <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline">{upcoming.map((s) => <li key={s.id} className="flex items-center justify-between px-4 py-3"><span>{s.propertyName} · {formatRange(s.startDate, s.endDate)}</span><Chip tone={s.status === "in_progress" ? "success" : "neutral"}>{s.status === "in_progress" ? "Activo" : "Próximo"}</Chip></li>)}</ul>
        </section>
      ) : null}
    </Page>
  );
}
