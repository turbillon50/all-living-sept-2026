import Link from "next/link";
import { Wordmark } from "@/ui/wordmark";

/** Marco compartido de las paginas legales: legibles, sobrias, sin distraer. */
export function LegalShell({
  titulo,
  actualizado,
  children,
}: {
  titulo: string;
  actualizado: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-green-950 text-ivory">
      <div className="mx-auto w-full max-w-2xl px-6 pt-safe" style={{ paddingBottom: "calc(48px + var(--safe-b))" }}>
        <div className="pt-10">
          <Link href="/" aria-label="Ir al inicio">
            <Wordmark size="sm" onDark />
          </Link>
        </div>

        <h1 className="mt-10 text-[34px] leading-[1.08] md:text-[44px] text-balance">{titulo}</h1>
        <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-ivory/60">
          Última actualización: {actualizado}
        </p>

        <div className="legal mt-10 space-y-7 text-[15px] leading-relaxed text-ivory/85">{children}</div>

        <div className="mt-14 border-t border-ivory/15 pt-6 text-[13px] text-ivory/60">
          <Link href="/privacidad" className="underline underline-offset-4">Aviso de privacidad</Link>
          <span className="px-2">·</span>
          <Link href="/terminos" className="underline underline-offset-4">Términos del servicio</Link>
          <span className="px-2">·</span>
          <Link href="/" className="underline underline-offset-4">Inicio</Link>
        </div>
      </div>
    </main>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-2 text-[19px] text-ivory">{children}</h2>;
}
