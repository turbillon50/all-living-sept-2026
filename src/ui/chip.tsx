import { cn } from "./cn";

const tones = {
  neutral: "bg-surface-2 text-text-2",
  accent: "bg-accent-soft text-green-900",
  success: "bg-[#e6f2ec] text-success",
  warning: "bg-[#f8efdf] text-warning",
  danger: "bg-[#f7e6e4] text-danger",
} as const;

export function Chip({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: keyof typeof tones; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2.5 py-1 text-[12px] font-medium tracking-wide", tones[tone], className)}>
      {children}
    </span>
  );
}
