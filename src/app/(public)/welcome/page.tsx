import Image from "next/image";
import { ButtonLink } from "@/ui/button";

/** Pantalla 02: brand moment. Fotografía completa y una sola frase. */
export default function Welcome() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-green-950 text-ivory">
      <Image src="/demo/tulum-sea.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-t from-green-950/85 via-green-950/20 to-transparent" />
      <div className="relative flex min-h-dvh flex-col justify-end px-6 pb-10 pt-safe md:items-center md:justify-center md:text-center fade-up" style={{ paddingBottom: "calc(40px + var(--safe-b))" }}>
        <p className="text-[11px] tracking-[0.36em] uppercase text-ivory/70">All Living</p>
        <h1 className="mt-3 text-[38px] leading-[1.04] md:text-[56px] max-w-xl text-balance">Más que propiedades, experiencias de vida.</h1>
        <p className="mt-4 text-ivory/80 max-w-md">Nosotros hacemos que lo vivas.</p>
        <div className="mt-8 flex flex-col gap-3 md:flex-row md:justify-center w-full max-w-sm">
          <ButtonLink href="/welcome/role" size="lg" variant="light">
            Comenzar
          </ButtonLink>
          <ButtonLink href="/sign-in" size="lg" variant="ghost-light">
            Ya tengo cuenta
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
