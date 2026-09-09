import { Ring } from "@/ui/ring";
import { Button } from "@/ui/button";
import { completeOnboarding } from "@/domains/identity/onboarding-actions";

/** Pantalla 08: ¡Listo! El anillo con atardecer, una frase, y a la app. */
export default function DoneStep() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 text-center fade-up" style={{ paddingBottom: "var(--safe-b)" }}>
      <Ring size={200} interval={2400} photos={["/demo/sunset-sm.webp", "/demo/tulum-sea-sm.webp", "/demo/palms-sm.webp", "/demo/yacht-sm.webp"]} />
      <h1 className="mt-10 text-[40px] leading-[1.04]">¡Listo!</h1>
      <p className="mt-3 text-[17px] text-text-2 max-w-xs">Tu viaje con All Living comienza ahora.</p>
      <form action={completeOnboarding} className="mt-10 w-full max-w-sm">
        <Button type="submit" size="lg">Ir al inicio</Button>
      </form>
    </main>
  );
}
