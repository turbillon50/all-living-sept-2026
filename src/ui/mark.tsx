"use client";

import { useId } from "react";
import { cn } from "./cn";

/**
 * ALL LIVING MÖBIUS v2
 * Cinta continua viva: no spinner, no aro, no icono tropical literal.
 * El movimiento idle es permanente y responde de forma sutil al puntero/touch.
 */
export function Mark({
  size = 28,
  className,
  onDark = false,
  interactive = false,
  motion = true,
}: {
  size?: number;
  className?: string;
  onDark?: boolean;
  interactive?: boolean;
  motion?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const gradient = `mobius-main-${uid}`;
  const glass = `mobius-glass-${uid}`;
  const shadow = `mobius-shadow-${uid}`;

  const resetTilt = (el: HTMLElement) => {
    el.style.setProperty("--mobius-rx", "0deg");
    el.style.setProperty("--mobius-ry", "0deg");
  };

  return (
    <span
      className={cn(
        "al-mobius inline-flex shrink-0",
        onDark && "on-dark",
        interactive && "is-interactive",
        motion && "is-alive",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
      onPointerMove={interactive ? (e) => {
        const box = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - box.left) / box.width - 0.5;
        const y = (e.clientY - box.top) / box.height - 0.5;
        e.currentTarget.style.setProperty("--mobius-rx", `${(-y * 10).toFixed(2)}deg`);
        e.currentTarget.style.setProperty("--mobius-ry", `${(x * 12).toFixed(2)}deg`);
      } : undefined}
      onPointerLeave={interactive ? (e) => resetTilt(e.currentTarget) : undefined}
    >
      <svg className="al-mobius-svg" viewBox="0 0 116 86" width="100%" height="100%" focusable="false">
        <defs>
          <linearGradient id={gradient} x1="10" y1="18" x2="108" y2="67" gradientUnits="userSpaceOnUse">
            <stop className="mobius-stop-a" offset="0" stopColor="#BDF9FB" />
            <stop className="mobius-stop-b" offset="0.24" stopColor="#29D5E3" />
            <stop className="mobius-stop-c" offset="0.55" stopColor="#079CC3" />
            <stop className="mobius-stop-d" offset="0.79" stopColor="#075D8A" />
            <stop className="mobius-stop-e" offset="1" stopColor="#85EEF2" />
          </linearGradient>
          <linearGradient id={glass} x1="18" y1="9" x2="88" y2="72" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="0.35" stopColor="#E7FFFF" stopOpacity="0.54" />
            <stop offset="0.72" stopColor="#89F2F4" stopOpacity="0.08" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <filter id={shadow} x="-25%" y="-30%" width="150%" height="170%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="blur" />
            <feOffset dy="3" result="offset" />
            <feColorMatrix in="offset" type="matrix" values="0 0 0 0 0.02  0 0 0 0 0.34  0 0 0 0 0.47  0 0 0 .26 0" />
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <g className="al-mobius-body" filter={`url(#${shadow})`}>
          {/* Cinta continua principal. El trazo ancho mantiene lectura limpia también a 16px. */}
          <path
            className="al-mobius-ribbon"
            d="M15 56 C10 38 18 19 34 15 C50 11 60 24 69 40 C78 56 90 65 100 56 C110 47 107 33 97 29 C84 24 74 34 64 51 C55 66 45 73 34 69 C24 66 18 62 15 56"
            fill="none"
            stroke={`url(#${gradient})`}
            strokeWidth="17"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Cruce superior: da lectura de cinta y no de serpiente. */}
          <path
            className="al-mobius-over"
            d="M38 15 C51 14 60 26 68 40"
            fill="none"
            stroke={`url(#${glass})`}
            strokeWidth="13.2"
            strokeLinecap="round"
          />

          {/* Cara inferior: profundidad física del giro. */}
          <path
            className="al-mobius-under"
            d="M64 51 C57 63 48 70 39 70"
            fill="none"
            stroke="#054F78"
            strokeOpacity="0.42"
            strokeWidth="12.5"
            strokeLinecap="round"
          />

          {/* Reflejo que recorre la superficie continuamente. */}
          <path
            className="al-mobius-sheen"
            d="M15 56 C10 38 18 19 34 15 C50 11 60 24 69 40 C78 56 90 65 100 56 C110 47 107 33 97 29 C84 24 74 34 64 51 C55 66 45 73 34 69 C24 66 18 62 15 56"
            fill="none"
            stroke="#EFFFFF"
            strokeOpacity="0.78"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="14 108"
          />
        </g>
      </svg>
    </span>
  );
}
