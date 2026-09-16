import Link from "next/link";
import { SiteFooter } from "@/ui/site-chrome";
export default function NotFound() { return <><main className="not-found"><h1>Ese escenario no está aquí.</h1><Link href="/eventos">Volver a la cartelera de eventos ↗</Link></main><SiteFooter /></>; }
