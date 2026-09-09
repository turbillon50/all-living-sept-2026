"use client";

import { useActionState, useState } from "react";
import { createIncident, type IncidentActionState } from "@/domains/operations/actions";
import { Button } from "@/ui/button";

type Target = { key: string; propertyId: string; stayId: string; label: string };
const TYPES = [["urgencia", "Urgencia"], ["propiedad", "Propiedad"], ["servicio", "Servicio"], ["acceso", "Acceso"], ["concierge", "Concierge"], ["otro", "Otro"]] as const;

export function IncidentForm({ targets, defaultKey, defaultType }: { targets: Target[]; defaultKey: string; defaultType: string }) {
  const [state, action, pending] = useActionState<IncidentActionState, FormData>(createIncident, null);
  const [key, setKey] = useState(defaultKey);
  const t = targets.find((x) => x.key === key) ?? targets[0];
  if (!t) return <p className="mt-8 text-text-2">No tienes propiedades ni estancias asociadas todavía.</p>;
  return (
    <form action={action} className="mt-8 flex flex-col gap-5">
      <input type="hidden" name="propertyId" value={t.propertyId} />
      <input type="hidden" name="stayId" value={t.stayId} />
      <label className="flex flex-col gap-1.5"><span className="text-sm font-medium">Dónde</span><select value={key} onChange={(e) => setKey(e.target.value)} className="min-h-12 rounded-[var(--radius-ctl)] bg-surface hairline px-4 text-[15px]">{targets.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</select></label>
      <fieldset><legend className="mb-2 text-sm font-medium">Tipo</legend><div className="flex flex-wrap gap-2">{TYPES.map(([v, l]) => <label key={v} className="cursor-pointer"><input type="radio" name="type" value={v} defaultChecked={v === defaultType} className="peer sr-only" /><span className="inline-flex min-h-10 items-center rounded-[var(--radius-pill)] bg-surface hairline px-4 text-sm peer-checked:bg-accent peer-checked:text-on-accent">{l}</span></label>)}</div></fieldset>
      <label className="flex flex-col gap-1.5"><span className="text-sm font-medium">Prioridad</span><select name="priority" defaultValue={defaultType === "urgencia" ? "urgent" : "medium"} className="min-h-12 rounded-[var(--radius-ctl)] bg-surface hairline px-4 text-[15px]"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="urgent">Urgente</option></select></label>
      <label className="flex flex-col gap-1.5"><span className="text-sm font-medium">Qué pasa</span><textarea name="description" rows={4} maxLength={1000} required className="rounded-[var(--radius-ctl)] bg-surface hairline px-4 py-3 text-[15px]" placeholder="Descríbelo como se lo contarías a alguien de la casa." /></label>
      <p className="text-[12px] text-muted">Fotos y video se agregan en la siguiente entrega (subida a Blob).</p>
      {state?.error ? <p role="alert" className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" size="lg" loading={pending}>Enviar</Button>
    </form>
  );
}
