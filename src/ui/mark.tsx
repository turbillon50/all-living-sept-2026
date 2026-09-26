import { cn } from "./cn";

/**
 * LA MONSTERA — símbolo de ALL LIVING.
 *
 * La hoja que crece donde la marca opera: Tulum, el Caribe, el trópico.
 * Sus hendiduras dejan pasar la luz — por eso la planta se llama "de costillas":
 * crece abriéndose, no cerrándose. Es lo contrario a un candado.
 *
 * Forma llena dentro de un círculo, sin contorno: se lee a 16px y en monocromo.
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
        <path
          className="al-mark-leaf"
          fill="currentColor"
          d="M12 2C7 2 3 6.4 3 11.6c0 4.4 2.9 8 6.8 8.9v-4.6H6.2v-1.7h3.6v-2.4H5.4v-1.7h4.4V7.7H6.6V6h3.2V2.1c.4 0 .8-.1 1.2-.1zm1.4.2v3.9h3.2v1.7h-3.2v2.4h4.4v1.7h-4.4v2.4h3.6v1.7h-3.6v4.5c3.8-1 6.6-4.5 6.6-8.9 0-4.7-3.3-8.7-7.6-9.4z"
        />
      </svg>
    </span>
  );
}
