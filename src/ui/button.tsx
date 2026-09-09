import Link from "next/link";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "light" | "ghost-light";
type Size = "md" | "lg" | "sm";

const base =
  "press inline-flex items-center justify-center gap-2 font-medium select-none rounded-[var(--radius-pill)] transition-colors duration-[var(--duration-micro)] disabled:opacity-50 disabled:pointer-events-none min-h-11";
const variants: Record<Variant, string> = {
  primary: "bg-green-950 text-ivory hover:bg-green-900 active:bg-green-950",
  secondary: "bg-surface text-text hairline hover:bg-surface-2",
  ghost: "text-text hover:bg-surface-2",
  danger: "bg-danger text-ivory hover:brightness-95",
  /** Sobre fotografía oscura: botón claro con texto verde profundo. */
  light: "bg-ivory text-green-950 hover:bg-sand-100 active:bg-sand-200",
  "ghost-light": "text-ivory hover:bg-ivory/10",
};
const sizes: Record<Size, string> = { sm: "px-3.5 text-sm min-h-10", md: "px-5 text-[15px]", lg: "px-6 text-base min-h-13 w-full" };

type Common = { variant?: Variant; size?: Size; className?: string; loading?: boolean; children: React.ReactNode };

export function Button({
  variant = "primary",
  size = "md",
  className,
  loading,
  children,
  ...rest
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
  ...rest
}: Common & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </Link>
  );
}
