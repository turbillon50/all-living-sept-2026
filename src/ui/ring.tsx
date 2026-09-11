"use client";

import { useEffect, useState } from "react";
import { cn } from "./cn";

export const RING_PHOTOS = [
  "/demo/tulum-sea-sm.webp",
  "/demo/palms-sm.webp",
  "/demo/sunset-sm.webp",
  "/demo/yacht-sm.webp",
  "/demo/cenote-sm.webp",
  "/demo/villa-pool-sm.webp",
  "/demo/mountain-sm.webp",
  "/demo/city-sm.webp",
];

export const RING_MESSAGES = ["Preparando tu estancia…", "Conectando destinos…", "Buscando experiencias…", "Casi listo…", "Preparando algo extraordinario…"];

/**
 * EL ANILLO. La fotografía vive en la banda; se revela alrededor y cambia con crossfade.
 * Calmado, nunca ruleta. Respeta prefers-reduced-motion. Sin porcentaje salvo progreso real.
 */
export function Ring({
  size = 176,
  photos = RING_PHOTOS,
  message,
  className,
  interval = 2800,
  label = "Cargando",
  band = 0.36,
}: {
  size?: number;
  photos?: string[];
  message?: string;
  className?: string;
  interval?: number;
  label?: string;
  band?: number;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (photos.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % photos.length), interval);
    return () => clearInterval(t);
  }, [photos.length, interval]);
  return (
    <div className={cn("flex flex-col items-center gap-7", className)} role="status" aria-live="polite" aria-label={label}>
      <div className="ring ring-enter" style={{ ["--ring-size" as string]: `${size}px`, ["--ring-band" as string]: String(band) }}>
        <div className="ring-band">
          {photos.map((src, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" className={idx === i ? "is-active" : undefined} draggable={false} decoding="async" />
          ))}
        </div>
        <div className="ring-reveal" aria-hidden />
        <div className="ring-track" aria-hidden />
        <div className="ring-inner" aria-hidden />
      </div>
      {message ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-[14px] text-text-2 tracking-wide fade-in">{message}</p>
          <span className="hairline-short" aria-hidden />
        </div>
      ) : null}
    </div>
  );
}
