import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { HeroHeader } from "@/ui/primitives";
import { flightsReady } from "@/integrations/flights/duffel-provider";
import { FlightSearch } from "./flight-search";
export const dynamic="force-dynamic";
export default function FlightsPage(){return <Page wide><TopBar back="/explore" title="Vuelos"/><HeroHeader src="/demo/sunset.webp" alt="Horizonte del Caribe" eyebrow="CÓMO LLEGAR" title="Tu viaje empieza antes de llegar." subtitle="Busca tu vuelo y conéctalo con tu estancia en el Caribe." height="min-h-[400px] md:min-h-[500px]"/><div className="relative z-10 -mt-7 rounded-[30px] bg-[color-mix(in_oklab,var(--color-surface)_94%,transparent)] p-4 shadow-[0_22px_55px_rgb(4_63_80_/_0.13)] backdrop-blur-xl md:mx-auto md:max-w-5xl md:p-7"><FlightSearch ready={flightsReady()}/></div></Page>}
