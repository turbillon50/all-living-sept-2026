"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ring } from "@/ui/ring";
import { Wordmark } from "@/ui/wordmark";

/** El anillo completa su vuelta y la app continúa. Nunca más de ~1.8 s. */
export function Splash({ target }: { target: string }) {
  const router = useRouter();
  useEffect(() => {
    router.prefetch(target);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => router.replace(target), reduce ? 300 : 1800);
    return () => clearTimeout(t);
  }, [router, target]);
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-10 bg-bg px-6">
      <Ring size={176} label="Abriendo All Living" />
      <Wordmark tagline />
    </main>
  );
}
