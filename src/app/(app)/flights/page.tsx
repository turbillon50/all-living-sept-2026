import { Page } from "@/ui/page";
import { HeroHeader } from "@/ui/primitives";
import { TravelTabs } from "@/ui/travel-tabs";
import { flightsReady } from "@/integrations/flights/duffel-provider";
import { FlightSearch } from "./flight-search";
import "./flights.css";
export const dynamic = "force-dynamic";
export default function FlightsPage() {
  return <Page wide className="md:pb-28"><TravelTabs current="flights" />
    <HeroHeader src="/demo/sunset.webp" alt="Atardecer sobre el Caribe" eyebrow="ALL LIVING · VUELOS" title={<>El viaje empieza<br />con un despegue.</>} subtitle="Encuentra tu vuelo. Compara aerolíneas, horarios y formas de llegar." height="min-h-[280px] md:min-h-[340px]" />
    <FlightSearch ready={flightsReady()} today={new Date().toISOString().slice(0, 10)} />
  </Page>;
}
