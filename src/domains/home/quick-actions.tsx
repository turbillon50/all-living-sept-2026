import Link from "next/link";
import { Sparkles, Car, ChefHat, Ship, ConciergeBell } from "lucide-react";

const ITEMS = [
  { href: "/stays", label: "Preparar estancia", Icon: Sparkles },
  { href: "/support", label: "Concierge", Icon: ConciergeBell },
  { href: "/services/transport", label: "Transporte", Icon: Car },
  { href: "/services/chefs", label: "Chef", Icon: ChefHat },
  { href: "/services/yachts", label: "Yate", Icon: Ship },
];

/** Fila deslizable de servicios: pocas decisiones por pantalla. */
export function QuickActions({ stayId }: { stayId?: string | null }) {
  return (
    <ul className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5 md:mx-0 md:px-0 md:flex-wrap">
      {ITEMS.map(({ href, label, Icon }) => (
        <li key={href} className="shrink-0">
          <Link
            href={href === "/stays" && stayId ? `/stays/${stayId}/prepare` : href}
            className="press flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] bg-surface hairline px-4 text-[14px] font-medium hover:bg-surface-2"
          >
            <Icon size={17} strokeWidth={1.8} aria-hidden className="text-green-900" />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
