"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Ring, RING_MESSAGES } from "@/ui/ring";
import { Wordmark } from "@/ui/wordmark";

/** Entrada inmersiva: una sola identidad viva, agua + Möbius + wordmark. */
export function Splash({ target }: { target: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("Cargando tu experiencia…");
  useEffect(() => {
    router.prefetch(target);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const m = setTimeout(() => setMsg(RING_MESSAGES[1] ?? "Conectando destinos…"), 900);
    const t = setTimeout(() => router.replace(target), reduce ? 350 : 2400);
    return () => { clearTimeout(t); clearTimeout(m); };
  }, [router, target]);

  return (
    <main className="splash-ocean min-h-dvh flex flex-col items-center justify-center px-6 pt-safe text-white" style={{ paddingBottom: "calc(28px + var(--safe-b))" }}>
      <div className="splash-depth splash-depth-a" aria-hidden />
      <div className="splash-depth splash-depth-b" aria-hidden />
      <div className="splash-caustics" aria-hidden />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center justify-center gap-8">
        <Ring size={224} message={msg} label="Abriendo All Living" />
        <Wordmark size="lg" tagline onDark mark={false} />
      </div>
    </main>
  );
}
