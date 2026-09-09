"use client";

import { useActionState } from "react";
import { submitProvider, type ProviderActionState } from "@/domains/providers/actions";
import { SERVICE_CATEGORIES } from "@/domains/services/categories";
import { Button } from "@/ui/button";
import { Field } from "@/ui/field";

const ZONES = ["Tulum", "Playa del Carmen", "Cancún", "Valle de Bravo", "Ciudad de México", "Los Cabos"];

export function ProviderForm({ defaults }: { defaults: { kind: string; businessName: string; primaryCategory: string; description: string; contactPhone: string; contactEmail: string } }) {
  const [state, action, pending] = useActionState<ProviderActionState, FormData>(submitProvider, null);
  const select = "min-h-12 rounded-[var(--radius-ctl)] bg-surface hairline px-4 text-[15px]";
  return (
    <form action={action} className="mt-8 flex flex-col gap-5">
      <label className="flex flex-col gap-1.5"><span className="text-sm font-medium">Eres</span><select name="kind" defaultValue={defaults.kind} className={select}><option value="person">Persona</option><option value="company">Empresa</option></select></label>
      <Field label="Nombre comercial" name="businessName" defaultValue={defaults.businessName} required />
      <label className="flex flex-col gap-1.5"><span className="text-sm font-medium">Categoría principal</span><select name="primaryCategory" defaultValue={defaults.primaryCategory} className={select}>{SERVICE_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}</select></label>
      <fieldset><legend className="mb-2 text-sm font-medium">Zonas donde trabajas</legend><div className="flex flex-wrap gap-2">{ZONES.map((z) => <label key={z} className="cursor-pointer"><input type="checkbox" name="zone" value={z} className="peer sr-only" /><span className="inline-flex min-h-10 items-center rounded-[var(--radius-pill)] bg-surface hairline px-4 text-sm peer-checked:bg-accent peer-checked:text-on-accent">{z}</span></label>)}</div></fieldset>
      <label className="flex flex-col gap-1.5"><span className="text-sm font-medium">Descripción</span><textarea name="description" rows={4} maxLength={600} defaultValue={defaults.description} required className="rounded-[var(--radius-ctl)] bg-surface hairline px-4 py-3 text-[15px]" placeholder="Qué ofreces, con qué equipo, desde cuándo." /></label>
      <div className="grid grid-cols-2 gap-3"><Field label="Teléfono" name="contactPhone" type="tel" defaultValue={defaults.contactPhone} required /><Field label="Correo" name="contactEmail" type="email" defaultValue={defaults.contactEmail} required /></div>
      <fieldset className="rounded-[var(--radius-card)] bg-surface hairline p-4 flex flex-col gap-3">
        <legend className="px-1 text-sm font-medium">Tu primer servicio</legend>
        <Field label="Nombre del servicio" name="serviceName" placeholder="Cena privada · 4 tiempos" required />
        <div className="grid grid-cols-2 gap-3"><Field label="Precio desde (MXN, opcional)" name="priceFrom" type="number" inputMode="numeric" min={0} /><label className="flex flex-col gap-1.5"><span className="text-sm font-medium">Unidad</span><select name="unit" defaultValue="servicio" className={select}>{["servicio", "persona", "hora", "día", "trayecto", "salida", "sesión"].map((u) => <option key={u} value={u}>{u}</option>)}</select></label></div>
      </fieldset>
      <p className="text-[13px] text-muted">Identificación, documentos, datos fiscales y cuenta de pagos se piden en la verificación, después de esta solicitud.</p>
      {state?.error ? <p role="alert" className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" size="lg" loading={pending}>Enviar solicitud</Button>
    </form>
  );
}
