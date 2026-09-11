import Image from "next/image";
import { ButtonLink } from "@/ui/button";
import { Wordmark } from "@/ui/wordmark";

/** Pantalla 02: brand moment. Fotografía completa, la marca arriba, una sola promesa. */
export default function Welcome() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-green-950 text-ivory">
      <Image src="/demo/tulum-sea.webp" alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-green-950/45 via-transparent to-green-950/85" />
      <div className="relative flex min-h-dvh flex-col justify-between px-6 pt-safe" style={{ paddingBottom: "calc(36px + var(--safe-b))" }}>
        <div className="pt-12 flex justify-center md:justify-start"><Wordmark size="lg" tagline onDark /></div>
        <div className="md:mx-auto md:max-w-xl md:text-center fade-up">
          <h1 className="text-[40px] leading-[1.02] md:text-[60px] text-balance">Más que propiedades, experiencias de vida.</h1>
          <p className="mt-4 text-[11px] tracking-[0.3em] uppercase text-ivory/80">Lugares extraordinarios. Personas extraordinarias.</p>
          <div className="mt-9 flex flex-col gap-2.5 md:flex-row md:justify-center">
            <ButtonLink href="/welcome/role" size="lg" variant="light" className="md:w-auto md:px-10">Comenzar</ButtonLink>
            <ButtonLink href="/sign-in" size="lg" variant="ghost-light" className="md:w-auto md:px-10">Ya tengo cuenta</ButtonLink>
          </div>
        </div>
      </div>
    </main>
  );
}
