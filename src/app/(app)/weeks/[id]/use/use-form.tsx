"use client";

import { useActionState } from "react";
import { useWeek, type WeekActionState } from "@/domains/fractions/actions";
import { Button } from "@/ui/button";
import { Field } from "@/ui/field";

export function UseWeekForm({ weekId, maxGuests, rules }: { weekId: string; maxGuests: number; rules: string[] }) {
  const [state, action, pending] = useActionState<WeekActionState, FormData>(useWeek, null);
  return (
    <form action={action} className="mt-8 flex flex-col gap-5">
      <input type="hidden" name="weekId" value={weekId} />
      <Field label="¿Cuántas personas viajan?" name="guestsCount" type="number" inputMode="numeric" min={1} max={maxGuests} defaultValue={2} required hint={`Hasta ${maxGuests} en esta casa. Podrás invitarlas después.`} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Hora estimada de llegada" name="arrivalTime" type="time" defaultValue="16:00" />
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">¿Cómo llegas?</span>
          <select name="arrivalMode" defaultValue="vuelo" className="min-h-12 rounded-[var(--radius-ctl)] bg-surface hairline px-4 text-[15px]">
            <option value="vuelo">En vuelo</option>
            <option value="auto">En auto</option>
            <option value="otro">Otro</option>
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Algo que debamos saber (opcional)</span>
        <textarea name="notes" rows={3} maxLength={500} className="rounded-[var(--radius-ctl)] bg-surface hairline px-4 py-3 text-[15px]" placeholder="Celebración, alergias, cuna…" />
      </label>
      {rules.length > 0 ? (
        <div className="rounded-[var(--radius-card)] bg-surface hairline p-4">
          <p className="text-sm font-medium">Reglas de la casa</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-text-2">{rules.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
      ) : null}
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="rules" required className="mt-1 size-5 accent-[var(--color-accent)]" />
        <span>Acepto las reglas de la casa y que la estancia se registre a mi nombre.</span>
      </label>
      {state?.error ? <p role="alert" className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" size="lg" loading={pending}>Preparar estancia</Button>
    </form>
  );
}
