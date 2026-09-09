"use client";

import { useEffect, useState } from "react";
import { cn } from "./cn";

export const RING_PHOTOS = [
  "/demo/tulum-sea-sm.webp",
  "/demo/sand-dunes-sm.webp",
  "/demo/palms-sm.webp",
  "/demo/villa-facade-sm.webp",
  "/demo/yacht-sm.webp",
  "/demo/sunset-sm.webp",
  "/demo/mountain-sm.webp",
  "/demo/city-sm.webp",
];

/**
 * EL ANILLO. Mientras la app carga, el usuario ya empieza a viajar.
 * SVG + máscara circular + crossfade de fotografía. Calmado, nunca ruleta. Respeta reduced-motion.
 */
export function Ring({
  size = 168,
  photos = RING_PHOTOS,
  message,
  className,
  interval = 2600,
  label = "Cargando",
}: {
  size?: number;
  photos?: string[];
  message?: string;
  className?: string;
  interval?: number;
  label?: string;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (photos.length < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setI((v) => (v + 1) % photos.length), interval);
    return () => clearInterval(t);
  }, [photos.length, interval]);

  const r = 46;
  return (
    <div className={cn("flex flex-col items-center gap-6", className)} role="status" aria-live="polite" aria-label={label}>
      <div className="ring ring-enter" style={{ ["--ring-size" as string]: `${size}px` }}>
        <div className="ring-photo">
          {photos.map((src, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className={idx === i ? "is-active" : undefined} draggable={false} decoding="async" />
          ))}
        </div>
        <svg className="ring-svg" viewBox="0 0 100 100" aria-hidden>
          <circle className="ring-track" cx="50" cy="50" r={r} fill="none" strokeWidth="1.2" />
          <circle className="ring-arc" cx="50" cy="50" r={r} fill="none" strokeWidth="1.6" pathLength="600" />
        </svg>
      </div>
      {message ? <p className="text-sm text-text-2 tracking-wide fade-in">{message}</p> : null}
    </div>
  );
}

export const RING_MESSAGES = [
  "Preparando tu estancia…",
  "Conectando destinos…",
  "Buscando experiencias…",
  "Casi listo…",
  "Preparando algo extraordinario…",
];
