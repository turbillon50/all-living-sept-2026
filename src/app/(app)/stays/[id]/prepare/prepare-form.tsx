"use client";

import { useActionState } from "react";
import { prepareStay, type StayActionState } from "@/domains/stays/actions";
import { Button } from "@/ui/button";
import { Field } from "@/ui/field";

type Defaults = { arrivalMode: string; arrivalTime: string; pickup: boolean; grocery: boolean; chef: boolean; crib: boolean; nanny: boolean; celebration: string; flight: string };

const ASKS: Array<{ name: keyof Defaults; title: string; body: string }> = [
  { name: "pickup", title: "¿Recogemos a alguien?", body: "Chofer en el aeropuerto con tu nombre." },
  { name: "grocery", title: "¿Supermercado listo?", body: "Lo básico en el refrigerador al llegar." },
  { name: "chef", title: "¿Chef la primera noche?", body: "Cena en casa sin pensar en nada." },
  { name: "crib", title: "¿Necesitas cuna?", body: "La dejamos armada en la recámara que elijas." },
  { name: "nanny", title: "¿Niñera?", body: "Con costo, coordinada por concierge." },
];

export function PrepareForm({ stayId, defaults }: { stayId: string; defaults: Defaults }) {
  const [state, action, pending] = useActionState<StayActionState, FormData>(prepareStay, null);
  return (
    <form action={action} className="mt-8 flex flex-col gap-5">
      <input type="hidden" name="stayId" value={stayId} />
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">¿Cómo llegas?</span>
          <select name="arrivalMode" defaultValue={defaults.arrivalMode} className="min-h-12 rounded-[var(--radius-ctl)] bg-surface hairline px-4 text-[15px]">
            <option value="vuelo">En vuelo</option><option value="auto">En auto</option><option value="otro">Otro</option>
          </select>
        </label>
        <Field label="Hora estimada" name="arrivalTime" type="time" defaultValue={defaults.arrivalTime} />
      </div>
      <Field label="Vuelo (opcional)" name="flight" defaultValue={defaults.flight} placeholder="AM 512" autoComplete="off" />
      <div className="flex flex-col gap-2.5">
        {ASKS.map((a) => (
          <label key={a.name} className="flex cursor-pointer items-center gap-4 rounded-[var(--radius-card)] bg-surface hairline p-4">
            <span className="min-w-0 flex-1"><span className="block font-medium">{a.title}</span><span className="block text-sm text-text-2">{a.body}</span></span>
            <input type="checkbox" name={a.name} defaultChecked={Boolean(defaults[a.name])} className="peer sr-only" />
            <span className="relative h-7 w-12 shrink-0 rounded-full bg-sand-300 transition-colors peer-checked:bg-accent after:absolute after:top-0.5 after:left-0.5 after:size-6 after:rounded-full after:bg-ivory after:shadow after:transition-transform peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-focus" />
          </label>
        ))}
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">¿Celebramos algo?</span>
        <input name="celebration" defaultValue={defaults.celebration} maxLength={200} placeholder="Cumpleaños, aniversario…" className="min-h-12 rounded-[var(--radius-ctl)] bg-surface hairline px-4 text-[15px] placeholder:text-muted" />
      </label>
      {state?.error ? <p role="alert" className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" size="lg" loading={pending}>Guardar y avisar a concierge</Button>
    </form>
  );
}
