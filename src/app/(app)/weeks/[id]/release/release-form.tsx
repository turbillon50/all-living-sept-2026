"use client";

import { useActionState, useState } from "react";
import { releaseWeek, type WeekActionState } from "@/domains/fractions/actions";
import { Button } from "@/ui/button";
import { Field } from "@/ui/field";
import { money } from "@/core/format";

export function ReleaseForm({ weekId, nights, commissionPct }: { weekId: string; nights: number; commissionPct: number }) {
  const [state, action, pending] = useActionState<WeekActionState, FormData>(releaseWeek, null);
  const [hasEstimate, setHasEstimate] = useState(false);
  const [rate, setRate] = useState(0);
  const gross = rate * nights;
  const net = Math.round(gross * (1 - commissionPct / 100));
  return (
    <form action={action} className="mt-8 flex flex-col gap-5">
      <input type="hidden" name="weekId" value={weekId} />
      <div className="rounded-[var(--radius-card)] bg-surface hairline p-4 text-sm">
        <p className="font-medium">Cómo funciona</p>
        <ul className="mt-2 list-disc pl-5 text-text-2 space-y-1">
          <li>All Living opera la renta: huéspedes, limpieza y llegada.</li>
          <li>Comisión de operación: {commissionPct}% sobre lo cobrado.</li>
          <li>Mínimo {nights} noches. Puedes retirarla mientras no esté reservada.</li>
          <li>Hoy no hay canal conectado (Airbnb, Booking, Expedia): la semana queda liberada y se publica cuando exista integración autorizada.</li>
        </ul>
      </div>
      <label className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] bg-surface hairline p-4">
        <span className="text-sm"><span className="block font-medium">Tengo una tarifa estimada por noche</span><span className="block text-text-2">Opcional. Es tu estimación, no un ingreso prometido.</span></span>
        <input type="checkbox" name="hasEstimate" checked={hasEstimate} onChange={(e) => setHasEstimate(e.target.checked)} className="size-5 accent-[var(--color-accent)]" />
      </label>
      {hasEstimate ? (
        <>
          <Field label="Tarifa estimada por noche (MXN)" name="nightlyRateEstimate" type="number" inputMode="numeric" min={0} step={100} value={rate || ""} onChange={(e) => setRate(Number(e.target.value))} />
          <div className="rounded-[var(--radius-card)] bg-accent-soft p-4 text-sm text-green-900">
            <p className="text-[11px] tracking-[0.24em] uppercase">Estimación · no es ingreso confirmado</p>
            <p className="mt-2">Bruto {nights} noches: <strong>{money(gross)}</strong> · Neto después de comisión: <strong>{money(net)}</strong></p>
          </div>
        </>
      ) : null}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Reglas de cancelación</span>
        <select name="cancellationPolicy" defaultValue="moderada" className="min-h-12 rounded-[var(--radius-ctl)] bg-surface hairline px-4 text-[15px]">
          <option value="flexible">Flexible · sin costo hasta 14 días antes</option>
          <option value="moderada">Moderada · sin costo hasta 30 días antes</option>
          <option value="estricta">Estricta · sin reembolso</option>
        </select>
      </label>
      <input type="hidden" name="minNights" value={nights} />
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="confirm" required className="mt-1 size-5 accent-[var(--color-accent)]" />
        <span>Entiendo que al liberar la semana dejo de poder usarla mientras esté en inventario.</span>
      </label>
      {state?.error ? <p role="alert" className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" size="lg" loading={pending}>Liberar para renta</Button>
    </form>
  );
}
