import Image from "next/image";
import Link from "next/link";
import { Wordmark } from "@/ui/wordmark";

/** Pantalla 04: auth con Apple, Google y correo (Clerk), enmarcada en la casa. */
export function AuthFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-dvh md:grid md:grid-cols-2">
      <div className="relative hidden md:block">
        <Image src="/demo/villa-pool.webp" alt="" fill sizes="50vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-green-950/75 to-transparent" />
        <div className="absolute left-10 top-10"><Wordmark size="md" tagline onDark layout="inline" /></div>
        <p className="absolute bottom-10 left-10 right-10 font-serif text-[34px] leading-tight text-ivory">Lugares extraordinarios. Personas extraordinarias.</p>
      </div>
      <div className="flex min-h-dvh flex-col px-6 pt-safe pb-10 md:justify-center md:px-16">
        <div className="pt-6 md:pt-0">
          <Link href="/welcome" className="inline-block md:hidden"><Wordmark size="sm" layout="inline" /></Link>
          <h1 className="mt-8 text-[30px] md:text-[36px]">{title}</h1>
        </div>
        <div className="mt-5 fade-up">{children}</div>
        <p className="mt-8 text-center text-[12px] text-muted">Al continuar, aceptas nuestros <Link href="/terminos" className="underline underline-offset-4">Términos y Condiciones</Link>.</p>
      </div>
    </main>
  );
}

/** Apariencia de los componentes de Clerk para que parezcan de la casa. */
export const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    cardBox: "shadow-none w-full",
    card: "shadow-none bg-transparent px-0 pt-0 pb-0 gap-4",
    header: "hidden",
    socialButtonsBlockButton: "min-h-12 rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[15px] font-medium hover:bg-[var(--color-surface-2)]",
    socialButtonsBlockButtonText: "font-medium",
    dividerLine: "bg-[var(--color-line)]",
    dividerText: "text-[var(--color-muted)]",
    formFieldLabel: "text-sm font-medium",
    formFieldInput: "min-h-12 rounded-[var(--radius-ctl)] border-[var(--color-line)] bg-[var(--color-surface)] text-[15px]",
    formButtonPrimary: "min-h-12 rounded-[var(--radius-ctl)] bg-[var(--color-green-950)] text-[15px] font-medium shadow-none hover:bg-[var(--color-green-900)]",
    footer: "hidden",
    footerAction: "hidden",
    identityPreviewEditButton: "text-[var(--color-green-900)]",
    otpCodeFieldInput: "rounded-[var(--radius-ctl)] border-[var(--color-line)]",
  },
} as const;
