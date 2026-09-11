import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Star } from "@/ui/icons";
import { money } from "@/core/format";
import { Chip } from "@/ui/chip";
import type { ProviderCard as Card } from "./queries";

export function ProviderCard({ p }: { p: Card }) {
  return (
    <Link href={`/providers/${p.slug}`} className="press block">
      <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-sand-200" style={{ aspectRatio: "4/3" }}>
        {p.cover ? <Image src={p.cover} alt={p.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /> : null}
        {p.isDemo ? <span className="absolute left-3 top-3"><Chip>Demo</Chip></span> : null}
      </div>
      <div className="mt-2.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-medium truncate">{p.name}{p.verified ? <BadgeCheck size={16} className="shrink-0 text-green-900" aria-label="All Living Verified" /> : null}</p>
          <p className="text-sm text-text-2 truncate">{p.areas.join(" · ") || "Zona por confirmar"}</p>
        </div>
        <div className="shrink-0 text-right text-sm">
          {p.priceFrom ? <p className="font-medium">desde {money(p.priceFrom.amount, p.priceFrom.currency)}<span className="text-muted"> / {p.priceFrom.unit}</span></p> : <p className="text-muted">A cotizar</p>}
          {p.rating ? <p className="flex items-center justify-end gap-1 text-text-2"><Star size={13} aria-hidden /> {p.rating.avg.toFixed(1)} · {p.rating.count}</p> : <p className="text-[12px] text-muted">Sin reseñas aún</p>}
        </div>
      </div>
    </Link>
  );
}
