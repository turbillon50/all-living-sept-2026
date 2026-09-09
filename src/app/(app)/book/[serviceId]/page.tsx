import { notFound } from "next/navigation";
import { requireUser } from "@/domains/identity/current-user";
import { serviceById } from "@/domains/services/queries";
import { staysForUser } from "@/domains/stays/queries";
import { formatRange } from "@/core/format";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Photo } from "@/ui/photo";
import { BookingForm } from "./booking-form";

export const dynamic = "force-dynamic";

/** Pantalla 32: reserva compacta. Servicio, fecha, hora, personas, opciones, estancia, total, confirmación. */
export default async function BookPage({ params, searchParams }: { params: Promise<{ serviceId: string }>; searchParams: Promise<{ stay?: string }> }) {
  const { serviceId } = await params;
  const { stay } = await searchParams;
  const user = await requireUser();
  const svc = await serviceById(serviceId);
  if (!svc || !svc.service.active || svc.provider.status !== "approved") notFound();
  const stays = (await staysForUser(user.id)).filter((s) => s.status !== "completed" && s.status !== "cancelled");
  return (
    <Page>
      <TopBar back={`/providers/${svc.provider.slug}`} title="Solicitar reserva" />
      <div className="mt-2 flex gap-4">
        {svc.service.coverUrl ? <Photo src={svc.service.coverUrl} alt="" className="w-24 shrink-0" ratio="1/1" sizes="96px" /> : null}
        <div><h1 className="text-[26px] leading-[1.08]">{svc.service.name}</h1><p className="mt-1 text-sm text-text-2">{svc.provider.businessName} · All Living Verified</p></div>
      </div>
      <BookingForm
        service={{ id: svc.service.id, name: svc.service.name, priceFrom: svc.service.priceFrom ? Number(svc.service.priceFrom) : null, currency: svc.service.currency, unit: svc.service.unit, maxPeople: svc.service.maxPeople, options: svc.service.options, cancellationPolicy: svc.service.cancellationPolicy }}
        stays={stays.map((s) => ({ id: s.id, label: `${s.propertyName} · ${formatRange(s.startDate, s.endDate)}`, startDate: s.startDate }))}
        defaultStay={stay ?? stays[0]?.id ?? ""}
      />
    </Page>
  );
}
