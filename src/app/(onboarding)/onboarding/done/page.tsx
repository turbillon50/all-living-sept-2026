import { Ring } from "@/ui/ring";
import { Button } from "@/ui/button";
import { completeOnboarding } from "@/domains/identity/onboarding-actions";

/** Pantalla 08: welcome. El anillo, una frase, y a la app. */
export default function DoneStep() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 text-center fade-up" style={{ paddingBottom: "var(--safe-b)" }}>
      <Ring size={168} interval={2000} />
      <h1 className="mt-10 text-[32px] leading-[1.08] md:text-[40px] text-balance">Tu viaje con All Living comienza ahora.</h1>
      <p className="mt-3 text-text-2 max-w-sm">Stay · Enjoy · Belong</p>
      <form action={completeOnboarding} className="mt-10 w-full max-w-sm">
        <Button type="submit" size="lg">Entrar</Button>
      </form>
    </main>
  );
}
