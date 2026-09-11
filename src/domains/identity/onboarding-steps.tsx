import { cn } from "@/ui/cn";

/** Indicador de paso: discreto, sin porcentaje. */
export function Steps({ current, total = 4 }: { current: number; total?: number }) {
  return (
    <div className="flex gap-1.5" aria-label={`Paso ${current} de ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={cn("h-1 rounded-full transition-all duration-[var(--duration-nav)]", i < current ? "w-6 bg-accent" : "w-3 bg-sand-300")} />
      ))}
    </div>
  );
}
