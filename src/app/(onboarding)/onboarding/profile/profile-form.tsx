"use client";

import { useActionState } from "react";
import Image from "next/image";
import { saveProfile, type ActionState } from "@/domains/identity/onboarding-actions";
import { Button } from "@/ui/button";
import { Field } from "@/ui/field";

export function ProfileForm({ defaults, avatarUrl }: { defaults: { name: string; locale: string }; avatarUrl: string | null }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveProfile, null);
  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="relative size-16 overflow-hidden rounded-full bg-sand-200">
          {avatarUrl ? <Image src={avatarUrl} alt="" fill sizes="64px" className="object-cover" /> : null}
        </div>
        <p className="text-sm text-text-2">Tu foto viene de tu cuenta. Puedes cambiarla en Perfil → Seguridad.</p>
      </div>
      <Field label="Nombre" name="name" defaultValue={defaults.name} autoComplete="name" required error={state?.fields?.name} />
      <Field label="Teléfono (opcional)" name="phone" type="tel" autoComplete="tel" placeholder="+52" error={state?.fields?.phone} />
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Idioma</span>
        <select name="locale" defaultValue={defaults.locale} className="min-h-12 rounded-[var(--radius-ctl)] bg-surface hairline px-4 text-[15px]">
          <option value="es-MX">Español (México)</option>
          <option value="en-US">English</option>
        </select>
      </label>
      {state?.error ? <p role="alert" className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" size="lg" loading={pending} className="mt-2">Continuar</Button>
    </form>
  );
}
