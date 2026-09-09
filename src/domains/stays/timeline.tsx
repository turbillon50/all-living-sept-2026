import Link from "next/link";
import { Chip } from "@/ui/chip";
import { BOOKING_STATUS } from "@/domains/bookings/labels";

export type TimelineItem = { id: string; at: Date; title: string; subtitle?: string; status: string; href?: string };

/** Línea de tiempo de la estancia: hora, qué, quién, estado. */
export function Timeline({ items }: { items: TimelineItem[] }) {
  const fmtTime = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" });
  const fmtDay = new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short" });
  let lastDay = "";
  return (
    <ol className="flex flex-col">
      {items.map((it) => {
        const day = fmtDay.format(it.at);
        const showDay = day !== lastDay;
        lastDay = day;
        const st = BOOKING_STATUS[it.status] ?? { label: it.status, tone: "neutral" as const };
        const body = (
          <div className="flex items-start gap-4 py-3">
            <span className="w-12 shrink-0 pt-0.5 font-serif text-[17px]">{fmtTime.format(it.at)}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{it.title}</span>
              {it.subtitle ? <span className="block text-sm text-text-2">{it.subtitle}</span> : null}
            </span>
            <Chip tone={st.tone}>{st.label}</Chip>
          </div>
        );
        return (
          <li key={it.id}>
            {showDay ? <p className="mt-4 mb-1 text-[11px] tracking-[0.24em] uppercase text-muted capitalize">{day}</p> : null}
            {it.href ? <Link href={it.href} className="press block rounded-[var(--radius-ctl)] hover:bg-surface-2 -mx-2 px-2">{body}</Link> : body}
          </li>
        );
      })}
    </ol>
  );
}
