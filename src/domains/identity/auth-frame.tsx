import Image from "next/image";
import Link from "next/link";
import { Wordmark } from "@/ui/wordmark";

/** Pantalla 04: auth con Apple, Google y correo (Clerk), enmarcada en la casa. */
export function AuthFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-dvh md:grid md:grid-cols-2">
      <div className="relative hidden md:block">
        <Image src="/demo/villa-pool.webp" alt="" fill sizes="50vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/70 to-transparent" />
        <p className="absolute bottom-10 left-10 right-10 font-serif text-[32px] leading-tight text-ivory">Lugares extraordinarios. Personas extraordinarias.</p>
      </div>
      <div className="flex min-h-dvh flex-col px-6 pt-safe pb-10 md:justify-center md:px-16">
        <div className="pt-8 md:pt-0">
          <Link href="/welcome" className="inline-block">
            <Wordmark className="items-start" />
          </Link>
          <h1 className="mt-8 text-[28px] md:text-[34px]">{title}</h1>
        </div>
        <div className="mt-6 fade-up">{children}</div>
      </div>
    </main>
  );
}
