import { cn } from "./cn";
import { Mark } from "./mark";

type Props = {
  className?: string;
  tagline?: boolean;
  onDark?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  layout?: "stack" | "inline";
  mark?: boolean;
};

const SIZES = { sm: "text-[15px] tracking-[0.3em]", md: "text-[20px] tracking-[0.32em]", lg: "text-[26px] tracking-[0.34em]", xl: "text-[32px] tracking-[0.36em]" };
const MARK = { sm: 20, md: 26, lg: 36, xl: 46 };

export function Wordmark({ className, tagline = false, onDark = false, size = "md", layout = "stack", mark = true }: Props) {
  const color = onDark ? "text-white" : "text-text";
  const muted = onDark ? "text-white/72" : "text-muted";
  if (layout === "inline") {
    return (
      <span className={cn("inline-flex items-center gap-3", className)}>
        {mark ? <Mark size={MARK[size]} onDark={onDark} interactive /> : null}
        <span className="flex flex-col leading-none">
          <span className={cn("font-serif font-normal uppercase", SIZES[size], color)}>All Living</span>
          {tagline ? <span className={cn("mt-1.5 text-[9px] tracking-[0.34em] uppercase", muted)}>Stay · Enjoy · Belong</span> : null}
        </span>
      </span>
    );
  }
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {mark ? <Mark size={MARK[size] * 1.7} onDark={onDark} className="al-mark-enter" interactive /> : null}
      <span className={cn("font-serif font-normal uppercase leading-none", SIZES[size], color)}>All Living</span>
      {tagline ? <span className={cn("text-[10px] tracking-[0.36em] uppercase", muted)}>Stay · Enjoy · Belong</span> : null}
    </div>
  );
}
