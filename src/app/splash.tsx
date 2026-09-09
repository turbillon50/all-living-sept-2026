"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Ring, RING_MESSAGES } from "@/ui/ring";
import { Wordmark } from "@/ui/wordmark";

/** Pantalla 01: el anillo revela el Caribe mientras la app decide a dónde ir. Nunca más de ~2 s. */
export function Splash({ target }: { target: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState("Cargando tu experiencia…");
  useEffect(() => {
    router.prefetch(target);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const m = setTimeout(() => setMsg(RING_MESSAGES[1] ?? "Conectando destinos…"), 1100);
    const t = setTimeout(() => router.replace(target), reduce ? 300 : 2100);
    return () => { clearTimeout(t); clearTimeout(m); };
  }, [router, target]);
  return (
    <main className="min-h-dvh flex flex-col items-center justify-between bg-bg px-6 pt-safe" style={{ paddingBottom: "calc(48px + var(--safe-b))" }}>
      <div className="pt-16"><Wordmark size="lg" tagline /></div>
      <Ring size={188} message={msg} label="Abriendo All Living" />
      <span />
    </main>
  );
}
