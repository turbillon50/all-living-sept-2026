import Link from "next/link";

const ITEMS = [["/admin", "Resumen"], ["/admin/providers", "Proveedores"], ["/admin/properties", "Propiedades"], ["/admin/incidents", "Incidencias"], ["/admin/users", "Usuarios"], ["/admin/bookings", "Reservas"], ["/admin/audit", "Auditoría"]] as const;

export function AdminNav({ current }: { current: string }) {
  return (
    <nav aria-label="Admin" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
      {ITEMS.map(([href, label]) => <Link key={href} href={href} aria-current={current === href ? "page" : undefined} className={`inline-flex min-h-10 shrink-0 items-center rounded-[var(--radius-pill)] px-4 text-sm hairline ${current === href ? "bg-ink text-ivory border-ink" : "bg-surface"}`}>{label}</Link>)}
    </nav>
  );
}
