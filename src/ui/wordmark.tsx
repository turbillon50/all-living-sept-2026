import { cn } from "./cn";
import { RingMark } from "./ring";

type Props = { className?: string; tagline?: boolean; onDark?: boolean; size?: "sm" | "md" | "lg" | "xl"; layout?: "stack" | "inline" };

const SIZES = { sm: "text-[15px] tracking-[0.3em]", md: "text-[20px] tracking-[0.32em]", lg: "text-[26px] tracking-[0.34em]", xl: "text-[32px] tracking-[0.36em]" };
const RING = { sm: 18, md: 24, lg: 34, xl: 44 };

/** Wordmark de la casa: ALL LIVING en serif tracked + STAY | ENJOY | BELONG. Con el aro cuando hay espacio. */
export function Wordmark({ className, tagline = false, onDark = false, size = "md", layout = "stack" }: Props) {
  const color = onDark ? "text-ivory" : "text-text";
  const muted = onDark ? "text-ivory/70" : "text-muted";
  if (layout === "inline") {
    return (
      <span className={cn("inline-flex items-center gap-3", className)}>
        <RingMark size={RING[size]} onDark={onDark} />
        <span className="flex flex-col leading-none">
          <span className={cn("font-serif font-normal uppercase", SIZES[size], color)}>All Living</span>
          {tagline ? <span className={cn("mt-1.5 text-[9px] tracking-[0.34em] uppercase", muted)}>Stay · Enjoy · Belong</span> : null}
        </span>
      </span>
    );
  }
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <RingMark size={RING[size] * 1.6} onDark={onDark} />
      <span className={cn("font-serif font-normal uppercase leading-none", SIZES[size], color)}>All Living</span>
      {tagline ? <span className={cn("text-[10px] tracking-[0.36em] uppercase", muted)}>Stay · Enjoy · Belong</span> : null}
    </div>
  );
}
