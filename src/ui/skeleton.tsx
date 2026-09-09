import { cn } from "./cn";

/** Skeleton con dimensiones reales: la página no brinca cuando llega el dato. */
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn("skeleton", className)} style={style} aria-hidden />;
}
