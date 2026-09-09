import { cn } from "./cn";

export function Wordmark({ className, tagline = false }: { className?: string; tagline?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <span className="font-serif text-[22px] tracking-[0.32em] uppercase text-text">All Living</span>
      {tagline ? <span className="text-[11px] tracking-[0.34em] uppercase text-muted">Stay · Enjoy · Belong</span> : null}
    </div>
  );
}
