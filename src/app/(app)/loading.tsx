import { Skeleton } from "@/ui/skeleton";

/** Skeleton con estructura conocida (hero + fila + lista). Sin anillo para cargas normales. */
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 pt-safe pb-tabbar md:px-8" aria-busy>
      <div className="pt-10">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-9 w-3/4" />
        <Skeleton className="mt-3 h-5 w-1/2" />
      </div>
      <Skeleton className="mt-8 w-full rounded-[var(--radius-card)]" style={{ aspectRatio: "3/2" }} />
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    </main>
  );
}
