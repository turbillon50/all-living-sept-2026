import { cn } from "./cn";

/**
 * EL ARCO — símbolo de ALL LIVING.
 *
 * Un arco de medio punto abierto al piso: la puerta por la que se entra a un lugar,
 * y al mismo tiempo la A de ALL sin travesaño. Dentro, el punto: quien lo habita.
 * Una sola forma, un solo trazo, legible a 16px y en monocromo.
 * Reemplaza al aro anterior, que leía como argolla y no decía nada.
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
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        {/* El arco: piernas al piso, medio punto arriba. */}
        <path
          className="al-mark-arch"
          d="M4.4 20.4V11.6a7.6 7.6 0 0 1 15.2 0v8.8"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        {/* El umbral: la línea del piso, más corta que el arco. Respira. */}
        <path className="al-mark-sill" d="M7.6 20.4h8.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" opacity="0.35" />
        {/* Quien lo habita. */}
        <circle className="al-mark-dot" cx="12" cy="12.4" r="2.5" fill="currentColor" />
      </svg>
    </span>
  );
}
