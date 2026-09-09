import { ButtonLink } from "@/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] tracking-[0.28em] uppercase text-muted">404</p>
      <h1 className="mt-3 text-[30px]">Este lugar no existe.</h1>
      <p className="mt-2 text-text-2 max-w-sm">Quizá el enlace cambió o ya no está disponible.</p>
      <div className="mt-8">
        <ButtonLink href="/">Volver al inicio</ButtonLink>
      </div>
    </main>
  );
}
