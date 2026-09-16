"use client";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Plane } from "@/ui/icons";
import type { Carrier, FlightOffer, FlightSlice } from "@/integrations/flights/types";
import { airlineLogo, durationLabel, localDateLabel, localTime, priceLabel, stopCount } from "@/integrations/flights/offer-utils";

export function AirlineMark({ airline }: { airline: Carrier }) {
  const [failed, setFailed] = useState(false);
  const logo = airlineLogo(airline.logo_symbol_url || airline.logo_lockup_url);
  return <span className="journey-airline-mark">{logo && !failed ? <Image src={logo} alt={airline.name} width={48} height={48} unoptimized onError={() => setFailed(true)} /> : <span aria-label={airline.name}>{airline.iata_code || airline.name.slice(0, 2)}</span>}</span>;
}
function SliceSummary({ slice, label }: { slice: FlightSlice; label: string }) {
  const first = slice.segments[0]!, last = slice.segments.at(-1)!;
  const stops = stopCount(slice);
  return <div className="journey-slice"><span className="journey-leg-label">{label}<small>{localDateLabel(first.departing_at)}</small></span>
    <div className="journey-time"><strong>{localTime(first.departing_at)}</strong><span>{slice.origin.iata_code}</span></div>
    <div className="journey-line"><small>{durationLabel(slice.duration)}</small><span><i /><Plane size={16} aria-hidden /><i /></span><small>{stops === 0 ? "Sin escalas" : `${stops} escala${stops > 1 ? "s" : ""}`}</small></div>
    <div className="journey-time is-arrival"><strong>{localTime(last.arriving_at)}</strong><span>{slice.destination.iata_code}</span>{last.arriving_at.slice(0, 10) !== first.departing_at.slice(0, 10) ? <small>{localDateLabel(last.arriving_at)}</small> : null}</div>
  </div>;
}
export function FlightCard({ offer, adults, bestPrice }: { offer: FlightOffer; adults: number; bestPrice: boolean }) {
  const airline = offer.slices[0]!.segments[0]!.marketing_carrier;
  return <article className="journey-offer"><header className="journey-offer-head"><AirlineMark airline={airline} /><span><strong>{airline.name}</strong><small>{offer.slices[0]?.fare_brand_name || "Tarifa disponible"}</small></span>{bestPrice ? <span className="journey-price-badge">Menor precio de tu búsqueda</span> : null}</header>
    <div className="journey-offer-body"><div>{offer.slices.map((slice, index) => <SliceSummary key={index} slice={slice} label={index === 0 ? "Ida" : "Regreso"} />)}</div><div className="journey-price"><small>{offer.slices.length > 1 ? "Ida y vuelta" : "Solo ida"} · {adults} adulto{adults > 1 ? "s" : ""}</small><strong>{priceLabel(offer.total_amount, offer.total_currency)}</strong><span>Total del viaje</span></div></div>
    <details className="journey-details"><summary>Ver itinerario y equipaje<ArrowRight size={17} aria-hidden /></summary><div className="journey-details-content"><p className="journey-local-note">Todos los horarios corresponden a la hora local de cada aeropuerto.</p>
      {offer.slices.map((slice, sliceIndex) => <section key={sliceIndex} className="journey-itinerary"><h3>{sliceIndex === 0 ? "Ida" : "Regreso"} · {localDateLabel(slice.segments[0]!.departing_at)}{slice.fare_brand_name ? ` · ${slice.fare_brand_name}` : ""}</h3>
        {slice.segments.map((segment, segmentIndex) => <div key={segment.id}>{segmentIndex > 0 ? <p className="journey-connection">Conexión: {slice.segments[segmentIndex - 1]!.destination.iata_code === segment.origin.iata_code ? `${segment.origin.name || segment.origin.iata_code} (${segment.origin.iata_code})` : `cambio de aeropuerto ${slice.segments[segmentIndex - 1]!.destination.iata_code} → ${segment.origin.iata_code}`}</p> : null}
          <div className="journey-segment"><AirlineMark airline={segment.marketing_carrier} /><div><strong>{segment.marketing_carrier.name} {segment.marketing_carrier.iata_code}{segment.marketing_carrier_flight_number}</strong>
            <p>{localTime(segment.departing_at)} · {segment.origin.name || segment.origin.iata_code} ({segment.origin.iata_code}){segment.origin_terminal ? ` · Terminal ${segment.origin_terminal}` : ""}</p>
            <p>{localTime(segment.arriving_at)} · {segment.destination.name || segment.destination.iata_code} ({segment.destination.iata_code}){segment.destination_terminal ? ` · Terminal ${segment.destination_terminal}` : ""}</p>
            <small>{localDateLabel(segment.departing_at)} → {localDateLabel(segment.arriving_at)} · {durationLabel(segment.duration)}{segment.operating_carrier.name !== segment.marketing_carrier.name ? ` · Operado por ${segment.operating_carrier.name}` : ""}</small>
            {segment.stops?.map((stop, index) => <p key={index} className="journey-baggage">Parada en {stop.airport.name || stop.airport.iata_code} · {durationLabel(stop.duration)}</p>)}
            {segment.passengers?.length ? segment.passengers.map((passenger, index) => <p key={index} className="journey-baggage"><b>Adulto {index + 1}</b>{passenger.cabin_class_marketing_name ? ` · ${passenger.cabin_class_marketing_name}` : ""} · {passenger.baggages?.length ? passenger.baggages.map(bag => `${bag.quantity} ${bag.type === "checked" ? "pieza(s) documentada(s)" : bag.type === "carry_on" ? "pieza(s) de mano" : "pieza(s) de equipaje"}`).join(" · ") : "Equipaje por confirmar con la aerolínea"}</p>) : <p className="journey-baggage">Equipaje por confirmar con la aerolínea</p>}
          </div></div>
        </div>)}
      </section>)}<p className="journey-local-note">Precio obtenido al consultar. La disponibilidad y la tarifa pueden cambiar. La compra de boletos estará disponible próximamente.</p>
    </div></details>
  </article>;
}
