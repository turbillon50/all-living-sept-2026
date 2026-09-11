"use client";

import { Mark } from "./mark";
import { cn } from "./cn";

export const RING_MESSAGES = [
  "Preparando tu estancia…",
  "Conectando destinos…",
  "Buscando experiencias…",
  "Casi listo…",
  "Preparando algo extraordinario…",
];

/** Compatibilidad histórica: Ring ahora es el símbolo Möbius vivo. */
export function Ring({
  size = 176,
  message,
  className,
  label = "Cargando",
}: {
  size?: number;
  photos?: string[];
  message?: string;
  className?: string;
  interval?: number;
  label?: string;
  band?: number;
}) {
  return (
    <div className={cn("mobius-loader flex flex-col items-center gap-7", className)} role="status" aria-live="polite" aria-label={label}>
      <div className="mobius-loader-stage" style={{ width: size, height: size }}>
        <div className="mobius-caustic mobius-caustic-a" aria-hidden />
        <div className="mobius-caustic mobius-caustic-b" aria-hidden />
        <div className="mobius-water-ripple" aria-hidden />
        <Mark size={size * 0.9} className="mobius-loader-mark" motion interactive />
      </div>
      {message ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-[14px] text-current/75 tracking-wide fade-in">{message}</p>
          <span className="hairline-short" aria-hidden />
        </div>
      ) : null}
    </div>
  );
}
