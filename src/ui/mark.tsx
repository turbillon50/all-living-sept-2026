import { cn } from "./cn";

/**
 * ALL LIVING MÖBIUS — símbolo maestro.
 * Superficie continua inspirada en una banda de Möbius: pertenencia, lugar,
 * movimiento y experiencia sin principio ni final.
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
    >
      <svg viewBox="0 0 64 48" width="100%" height="100%" focusable="false">
        <defs>
          <linearGradient id="al-mobius-main" x1="8" y1="8" x2="58" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#71E9EE" />
            <stop offset="0.28" stopColor="#1CC6D4" />
            <stop offset="0.58" stopColor="#0D7FA6" />
            <stop offset="0.82" stopColor="#075C82" />
            <stop offset="1" stopColor="#BCEFF1" />
          </linearGradient>
          <linearGradient id="al-mobius-highlight" x1="16" y1="8" x2="50" y2="39" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="0.45" stopColor="#D8FAFA" stopOpacity="0.55" />
            <stop offset="1" stopColor="#8FE6EA" stopOpacity="0" />
          </linearGradient>
          <filter id="al-mobius-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.65" />
          </filter>
        </defs>

        <g className="al-mobius-body">
          <path
            className="al-mobius-shadow"
            d="M7.5 29.5C7.5 17.2 16.4 8.6 27.2 11.7c8.7 2.5 12.9 12.8 18.8 17.1 3.8 2.8 8 2.1 9.9-1.1 1.8-3 1-7-2.3-9.4-5-3.7-10.7-.7-14.8 6.2-5.4 9.2-9.5 17.1-17.7 17.1-6.6 0-11.6-3.8-13.4-9.3-1.1-3.4-.4-6.4-.4-6.4Z"
            fill="#063D5A"
            opacity="0.22"
            filter="url(#al-mobius-soft)"
            transform="translate(0 1.6)"
          />
          <path
            d="M7.5 29.5C7.5 17.2 16.4 8.6 27.2 11.7c8.7 2.5 12.9 12.8 18.8 17.1 3.8 2.8 8 2.1 9.9-1.1 1.8-3 1-7-2.3-9.4-5-3.7-10.7-.7-14.8 6.2-5.4 9.2-9.5 17.1-17.7 17.1-6.6 0-11.6-3.8-13.4-9.3-1.1-3.4-.4-6.4-.4-6.4Z"
            fill="url(#al-mobius-main)"
          />
          <path
            className="al-mobius-twist"
            d="M23.2 14.1c5.2-2 10 .7 13.8 6.2 1.5 2.2 2.8 4.2 4.3 6.2-4-1.5-8.2-1.1-12.1 1.2-4.2 2.4-7.7 6-11.4 8.6 3-4.7 5.1-10.1 5.4-15.9.2-2.4.1-4.5 0-6.3Z"
            fill="url(#al-mobius-highlight)"
            opacity="0.88"
          />
          <path
            d="M12 31.5c1.7 4.4 5.8 6.9 10.9 6.9 6.4 0 10.5-4.6 14.3-10.9"
            fill="none"
            stroke="#D9FAFA"
            strokeOpacity="0.42"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </span>
  );
}
