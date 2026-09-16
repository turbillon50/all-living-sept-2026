import { DEMO_EVENTS } from "./catalog";
import type { DemoOrder } from "./demo-model";
export function downloadFile(name: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function downloadCalendar(order: DemoOrder) {
  const escape = (value: string) => value.replaceAll("\\", "\\\\").replaceAll(";", "\\;").replaceAll(",", "\\,").replaceAll("\n", "\\n");
  const stamp = (date: Date) => date.toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}Z$/, "Z");
  const events = order.items.map((item, index) => {
    const event = DEMO_EVENTS.find(event => event.id === item.eventId)!;
    const start = new Date(`${item.date}T${event.time}:00-05:00`);
    return ["BEGIN:VEVENT", `UID:${order.id}-${index}@events.alliving.live`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(new Date(start.getTime() + 7200000))}`, `SUMMARY:${escape(`DEMO · ${event.title} · Sin reserva real`)}`, `DESCRIPTION:${escape("Evento de demostración de ALL LIVING. Fecha y recinto ficticios. No es una presentación anunciada ni un boleto válido.")}`, "STATUS:TENTATIVE", "TRANSP:TRANSPARENT", "END:VEVENT"].join("\r\n");
  });
  downloadFile(`${order.id}-demostracion.ics`, ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ALL LIVING//Eventos Demo//ES", ...events, "END:VCALENDAR"].join("\r\n"), "text/calendar;charset=utf-8");
}
