import { Sparkles, Car, ChefHat, Ship, ConciergeBell } from "@/ui/icons";
import { IconAction } from "@/ui/primitives";

const ITEMS = [
  { href: "/support", label: "Concierge", Icon: ConciergeBell },
  { href: "/services/transport", label: "Transporte", Icon: Car },
  { href: "/services/chefs", label: "Chef", Icon: ChefHat },
  { href: "/services/yachts", label: "Yate", Icon: Ship },
  { href: "/stays", label: "Preparar", Icon: Sparkles },
];

/** Acciones rápidas en círculos: pocas decisiones por pantalla. */
export function QuickActions({ stayId }: { stayId?: string | null }) {
  return (
    <ul className="grid grid-cols-5 gap-2 md:flex md:gap-8">
      {ITEMS.map(({ href, label, Icon }) => (
        <li key={href}>
          <IconAction href={href === "/stays" && stayId ? `/stays/${stayId}/prepare` : href} label={label} Icon={Icon} tone="outline" />
        </li>
      ))}
    </ul>
  );
}
