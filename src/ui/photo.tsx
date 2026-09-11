import Image from "next/image";
import { cn } from "./cn";

/** Fotografía protagonista. Siempre con dimensiones reservadas: cero layout shift. */
export function Photo({
  src,
  alt,
  className,
  priority,
  sizes = "(max-width: 768px) 100vw, 50vw",
  ratio = "3/2",
  rounded = true,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  ratio?: string;
  rounded?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-sand-200", rounded && "rounded-[var(--radius-card)]", className)} style={{ aspectRatio: ratio }}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
