import Link from "next/link";
import { Building2, Plane, Gift, Sparkles } from "./icons";

const categories = [
  { id: "stays", label: "Hospedaje", href: "/explore", Icon: Building2 },
  { id: "flights", label: "Vuelos", href: "/flights", Icon: Plane },
  { id: "gifts", label: "Tarjetas", href: "/tarjetas", Icon: Gift },
  { id: "experiences", label: "Experiencias", href: "/services", Icon: Sparkles },
] as const;

/** The four travel products keep the same hierarchy on every discovery screen. */
export function TravelTabs({ current }: { current?: typeof categories[number]["id"] }) {
  return <nav aria-label="Organiza tu viaje" className="travel-products">
    {categories.map(({ id, label, href, Icon }) => <Link key={id} href={href} aria-current={id === current ? "page" : undefined}><Icon size={24} aria-hidden /><span>{label}</span></Link>)}
  </nav>;
}
