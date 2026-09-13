import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { flightsReady } from "@/integrations/flights/duffel-provider";
import { FlightSearch } from "./flight-search";
export const dynamic="force-dynamic";
export default function FlightsPage(){return <Page wide><TopBar back="/explore" title="Vuelos"/><header className="pt-6 pb-8 md:pt-10"><p className="text-[10px] tracking-[.28em] uppercase text-muted">All Living Travel</p><h1 className="mt-2 max-w-3xl text-[38px] leading-[1.02] md:text-[56px]">Tu viaje empieza antes de llegar.</h1><p className="mt-4 max-w-2xl text-[16px] leading-7 text-text-2">Busca tu vuelo y conéctalo con tu estancia, traslado y experiencias. Todo desde All Living.</p></header><FlightSearch ready={flightsReady()}/></Page>}
