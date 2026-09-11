import { cn } from "./cn";

/**
 * LA PALMA — símbolo de ALL LIVING.
 *
 * Dos hojas que nacen del mismo punto y se abren: el lugar y quien lo habita,
 * la misma raíz. Leídas juntas forman la A de ALL. Entre ellas, en el hueco,
 * el punto de bronce: el sol del Caribe.
 *
 * Forma llena, no contorno: se lee a 16px y en monocromo. Sustituye al arco
 * anterior, que leía como candado.
 */
export function Mark({
  size = 28,
  className,
  onDark = false,
  interactive = false,
}: {
  size?: number;
  className?: string;
  onDark?: boolean;
  interactive?: boolean;
}) {
  return (
    <span
      className={cn("al-mark inline-flex shrink-0", onDark && "on-dark", interactive && "is-interactive", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" width="100%" height="100%">
        <g className="al-mark-leaves" fill="currentColor">
          <path d="M12 2.4c-3 3.8-5.8 8.8-6.8 14.8-.2 1.3.1 2.1.9 2.6 2-1.2 3.7-3.6 4.9-6.6.6-1.7 1-3.4 1.1-5.1z" />
          <path d="M12 2.4c3 3.8 5.8 8.8 6.8 14.8.2 1.3-.1 2.1-.9 2.6-2-1.2-3.7-3.6-4.9-6.6-.6-1.7-1-3.4-1.1-5.1z" />
        </g>
        {/* El sol, en el hueco entre las dos hojas. */}
        <circle className="al-mark-sun" cx="12" cy="16.6" r="2.1" fill="var(--color-bronze-500)" />
      </svg>
    </span>
  );
}
