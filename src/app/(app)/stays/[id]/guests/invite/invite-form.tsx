"use client";

import { useActionState, useState } from "react";
import { inviteGuest, type StayActionState } from "@/domains/stays/actions";
import { Button, ButtonLink } from "@/ui/button";
import { Field } from "@/ui/field";

export function InviteForm({ stayId }: { stayId: string }) {
  const [state, action, pending] = useActionState<StayActionState, FormData>(inviteGuest, null);
  const [copied, setCopied] = useState(false);
  if (state?.ok && state.inviteUrl) {
    const url = state.inviteUrl.startsWith("http") ? state.inviteUrl : `${typeof window !== "undefined" ? window.location.origin : ""}${state.inviteUrl}`;
    return (
      <div className="mt-8 rounded-[var(--radius-card)] bg-accent-soft p-5 fade-up" role="status">
        <p className="font-serif text-[20px] text-green-900">Invitación lista.</p>
        <p className="mt-1 text-sm text-green-900/80">Comparte esta liga. Vence en 14 días.</p>
        <p className="mt-3 break-all rounded-[var(--radius-ctl)] bg-ivory px-3 py-2 text-[13px]">{url}</p>
        <div className="mt-4 flex gap-2">
          <Button type="button" size="sm" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); } catch { /* sin portapapeles */ } }}>{copied ? "Copiada" : "Copiar liga"}</Button>
          {typeof navigator !== "undefined" && "share" in navigator ? <Button type="button" size="sm" variant="secondary" onClick={() => navigator.share({ title: "Te invito a mi estancia · All Living", url }).catch(() => undefined)}>Compartir</Button> : null}
          <ButtonLink href={`/stays/${stayId}/guests`} size="sm" variant="ghost">Listo</ButtonLink>
        </div>
      </div>
    );
  }
  return (
    <form action={action} className="mt-8 flex flex-col gap-5">
      <input type="hidden" name="stayId" value={stayId} />
      <Field label="Nombre" name="name" required autoComplete="off" placeholder="María García" />
      <Field label="Correo (opcional)" name="email" type="email" autoComplete="off" placeholder="maria@correo.com" hint="Si lo pones, solo esa cuenta podrá aceptar." />
      <Field label="Teléfono (opcional)" name="phone" type="tel" autoComplete="off" placeholder="+52" />
      <label className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] bg-surface hairline p-4 text-sm">
        <span><span className="block font-medium">Puede reservar servicios</span><span className="block text-text-2">Chef, transporte, experiencias a cargo de la estancia.</span></span>
        <input type="checkbox" name="canBook" className="size-5 accent-[var(--color-accent)]" />
      </label>
      {state?.error ? <p role="alert" className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" size="lg" loading={pending}>Crear invitación</Button>
    </form>
  );
}
