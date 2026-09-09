import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { Page, PageHeader } from "@/ui/page";
import { AdminNav } from "@/domains/admin/nav";

export const dynamic = "force-dynamic";

export default async function AdminAudit() {
  const rows = await db().select({ a: schema.auditLogs, actor: schema.users }).from(schema.auditLogs).leftJoin(schema.users, eq(schema.users.id, schema.auditLogs.actorUserId)).orderBy(desc(schema.auditLogs.createdAt)).limit(150);
  const fmt = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return (
    <Page wide>
      <PageHeader eyebrow="Administración" title="Auditoría" description="Titularidad, pagos, accesos, aprobación de proveedores y cambios de estado de semana." />
      <AdminNav current="/admin/audit" />
      <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] bg-surface hairline">
        <table className="w-full text-left text-[13px]"><thead className="text-muted"><tr><th className="px-3 py-2">Cuándo</th><th className="px-3 py-2">Quién</th><th className="px-3 py-2">Acción</th><th className="px-3 py-2">Entidad</th><th className="px-3 py-2">Después</th></tr></thead>
          <tbody className="divide-y divide-line">{rows.map(({ a, actor }) => <tr key={a.id}><td className="px-3 py-2 whitespace-nowrap">{fmt.format(a.createdAt)}</td><td className="px-3 py-2">{actor?.name ?? "sistema"}</td><td className="px-3 py-2 font-medium">{a.action}</td><td className="px-3 py-2 text-muted">{a.entity}</td><td className="px-3 py-2 text-muted max-w-[320px] truncate">{a.after ? JSON.stringify(a.after) : ""}</td></tr>)}</tbody></table>
      </div>
    </Page>
  );
}
