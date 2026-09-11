"use client";

import { useActionState, useMemo, useState } from "react";
import { requestBooking, type BookingActionState } from "@/domains/bookings/actions";
import { money } from "@/core/format";
import { Button } from "@/ui/button";
import { Field } from "@/ui/field";

type Service = { id: string; name: string; priceFrom: number | null; currency: string; unit: string; maxPeople: number | null; options: Array<{ key: string; label: string; price: number }>; cancellationPolicy: string | null };

export function BookingForm({ service, stays, defaultStay }: { service: Service; stays: Array<{ id: string; label: string; startDate: string }>; defaultStay: string }) {
  const [state, action, pending] = useActionState<BookingActionState, FormData>(requestBooking, null);
  const [people, setPeople] = useState(2);
  const [opts, setOpts] = useState<string[]>([]);
  const [stayId, setStayId] = useState(defaultStay);
  const perPerson = service.unit === "persona";
  const subtotal = useMemo(() => {
    const base = service.priceFrom ?? 0;
    const chosen = service.options.filter((o) => opts.includes(o.key));
    return (perPerson ? base * people : base) + chosen.reduce((s, o) => s + (perPerson ? o.price * people : o.price), 0);
  }, [service, opts, people, perPerson]);
  const stayDate = stays.find((s) => s.id === stayId)?.startDate;
  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="mt-8 flex flex-col gap-5">
      <input type="hidden" name="serviceId" value={service.id} />
      {stays.length > 0 ? (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Para qué estancia</span>
          <select name="stayId" value={stayId} onChange={(e) => setStayId(e.target.value)} className="min-h-12 rounded-[var(--radius-ctl)] bg-surface hairline px-4 text-[15px]">
            <option value="">Sin estancia</option>
            {stays.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha" name="date" type="date" min={minDate} defaultValue={stayDate && stayDate > minDate ? stayDate : minDate} required />
        <Field label="Hora" name="time" type="time" defaultValue="18:00" required />
      </div>
      <Field label="Personas" name="people" type="number" inputMode="numeric" min={1} max={service.maxPeople ?? 50} value={people} onChange={(e) => setPeople(Number(e.target.value) || 1)} hint={service.maxPeople ? `Hasta ${service.maxPeople}.` : undefined} />
      {service.options.length > 0 ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">Extras</legend>
          {service.options.map((o) => (
            <label key={o.key} className="flex items-center justify-between rounded-[var(--radius-card)] bg-surface hairline p-3.5 text-sm">
              <span className="flex items-center gap-3"><input type="checkbox" name="option" value={o.key} checked={opts.includes(o.key)} onChange={(e) => setOpts((v) => (e.target.checked ? [...v, o.key] : v.filter((k) => k !== o.key)))} className="size-5 accent-[var(--color-accent)]" />{o.label}</span>
              <span className="text-text-2">{o.price === 0 ? "Incluido" : `+${money(o.price, service.currency)}${perPerson ? " / persona" : ""}`}</span>
            </label>
          ))}
        </fieldset>
      ) : null}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Notas para el proveedor (opcional)</span>
        <textarea name="notes" rows={2} maxLength={500} className="rounded-[var(--radius-ctl)] bg-surface hairline px-4 py-3 text-[15px]" placeholder="Alergias, punto de encuentro, celebración…" />
      </label>
      <div className="rounded-[var(--radius-card)] bg-surface hairline p-4 text-sm">
        <div className="flex justify-between"><span className="text-text-2">Subtotal</span><span>{service.priceFrom == null ? "A cotizar" : money(subtotal, service.currency)}</span></div>
        <div className="flex justify-between"><span className="text-text-2">Fees</span><span>{money(0, service.currency)}</span></div>
        <div className="mt-2 flex justify-between border-t border-line pt-2 font-medium"><span>Total</span><span className="font-serif text-[20px]">{service.priceFrom == null ? "A cotizar" : money(subtotal, service.currency)}</span></div>
        <p className="mt-2 text-[12px] text-muted">El pago se solicita cuando el proveedor confirme. {service.cancellationPolicy ?? ""}</p>
      </div>
      {state?.error ? <p role="alert" className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" size="lg" loading={pending}>Solicitar reserva</Button>
    </form>
  );
}
