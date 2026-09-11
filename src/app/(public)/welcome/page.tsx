import Image from "next/image";
import Link from "next/link";
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
          {/* Explorar va primero y no pide cuenta: se mira antes de pertenecer. */}
          <div className="mt-9 flex flex-col gap-2.5 md:flex-row md:justify-center">
            <ButtonLink href="/explore" size="lg" variant="light" className="md:w-auto md:px-10">Explorar</ButtonLink>
            <ButtonLink href="/welcome/role" size="lg" variant="ghost-light" className="md:w-auto md:px-10">Crear cuenta</ButtonLink>
          </div>
          <p className="mt-5 text-center text-[13px] text-ivory/70 md:text-center">
            <Link href="/sign-in" className="underline underline-offset-4 hover:text-ivory">Ya tengo cuenta</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
