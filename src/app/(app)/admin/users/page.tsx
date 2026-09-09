import { asc } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { requireRole } from "@/domains/identity/current-user";
import { setUserRole } from "@/domains/admin/actions";
import { ROLES } from "@/core/roles";
import { Page, PageHeader } from "@/ui/page";
import { AdminNav } from "@/domains/admin/nav";
import { Chip } from "@/ui/chip";
import { Button } from "@/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const admin = await requireRole("admin");
  const [users, roles] = await Promise.all([db().query.users.findMany({ orderBy: asc(schema.users.createdAt), limit: 200 }), db().query.userRoles.findMany()]);
  return (
    <Page wide>
      <PageHeader eyebrow="Administración" title="Usuarios" />
      <AdminNav current="/admin/users" />
      <ul className="mt-6 flex flex-col gap-2">
        {users.map((u) => { const mine = roles.filter((r) => r.userId === u.id && r.status === "active").map((r) => r.role); return (
          <li key={u.id} className="rounded-[var(--radius-card)] bg-surface hairline p-4">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-medium">{u.name} {u.isDemo ? <span className="text-muted">· demo</span> : null}</p><p className="text-sm text-text-2 truncate">{u.email} · contexto {u.activeContext}</p></div><div className="flex flex-wrap gap-1">{mine.map((r) => <Chip key={r} tone={r === "admin" ? "danger" : r === "operator" ? "warning" : "accent"}>{r}</Chip>)}</div></div>
            <form action={setUserRole} className="mt-3 flex flex-wrap items-center gap-2 text-sm"><input type="hidden" name="userId" value={u.id} /><select name="role" className="min-h-10 rounded-[var(--radius-ctl)] bg-bg hairline px-3">{ROLES.filter((r) => !mine.includes(r) && !(r === "admin" && u.id === admin.id)).map((r) => <option key={r} value={r}>{r}</option>)}</select><Button type="submit" name="action" value="grant" size="sm" variant="secondary">Otorgar</Button></form>
          </li>
        ); })}
      </ul>
    </Page>
  );
}
