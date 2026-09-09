"use client";

import { Button, ButtonLink } from "@/ui/button";

/** Error global: nunca una página blanca. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] tracking-[0.28em] uppercase text-muted">Algo no salió</p>
      <h1 className="mt-3 text-[30px]">No pudimos cargar esto.</h1>
      <p className="mt-2 text-text-2 max-w-sm">Ya quedó registrado. Puedes intentar de nuevo o volver al inicio.</p>
      {error.digest ? <p className="mt-2 text-[12px] text-muted">Ref. {error.digest}</p> : null}
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Intentar de nuevo</Button>
        <ButtonLink href="/" variant="secondary">Inicio</ButtonLink>
      </div>
    </main>
  );
}
