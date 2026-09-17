"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CalendarDays, Plane, Repeat, Users } from "@/ui/icons";
import type { FlightOffer, Carrier } from "@/integrations/flights/types";
import { airlineNames, durationLabel, localDateLabel, matchesDepartureDates, priceLabel, selectOffers, totalDuration, type OfferFilters } from "@/integrations/flights/offer-utils";
import { AirportField, type AirportChoice } from "./airport-field";
import { AirlineMark, FlightCard } from "./flight-results";

type SearchRecord = { origin: string; destination: string; depart: string; returnDate?: string; adults: number; cabin: string };
type SearchResult = { offers: FlightOffer[]; live: boolean; request: SearchRecord };

export function FlightSearch({ ready, today }: { ready: boolean; today: string }) {
  const [origin, setOrigin] = useState<AirportChoice>({ code: "", label: "" });
  const [destination, setDestination] = useState<AirportChoice>({ code: "CUN", label: "Cancún · CUN" });
  const [roundTrip, setRoundTrip] = useState(true), [depart, setDepart] = useState("");
  const [loading, setLoading] = useState(false), [error, setError] = useState("");
  const [queryChanged, setQueryChanged] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null), [now, setNow] = useState(0), [limit, setLimit] = useState(12);
  const [stops, setStops] = useState<OfferFilters["stops"]>("any"), [airline, setAirline] = useState(""), [sort, setSort] = useState<OfferFilters["sort"]>("price"), [currency, setCurrency] = useState("");
  const controller = useRef<AbortController | null>(null), resultsRef = useRef<HTMLElement>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => { if (!result) return; const timer = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(timer); }, [result]);
  const filtered = useMemo(() => selectOffers(result?.offers ?? [], { currency, stops, airline, sort, now }), [result, currency, stops, airline, sort, now]);
  const airlines = useMemo(() => [...new Set(result?.offers.flatMap(airlineNames) ?? [])].sort(), [result]);
  const logos = useMemo(() => { const map = new Map<string, Carrier>(); for (const offer of result?.offers ?? []) for (const slice of offer.slices) for (const segment of slice.segments) map.set(segment.marketing_carrier.name, segment.marketing_carrier); return [...map.values()]; }, [result]);
  const currencies = [...new Set(result?.offers.map(offer => offer.total_currency) ?? [])];
  const cheapest = filtered.length ? Math.min(...filtered.map(offer => Number(offer.total_amount))) : null;
  const quickest = filtered.length ? Math.min(...filtered.map(totalDuration)) : null;

  function invalidateResults() {
    controller.current?.abort(); controller.current = null;
    if (result || loading) setQueryChanged(true);
    setResult(null); setError(""); setLoading(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!origin.code || !destination.code) { setError("Elige el origen y el destino en las sugerencias, o escribe sus códigos de aeropuerto."); return; }
    const form = new FormData(event.currentTarget);
    const request = { origin: origin.code, destination: destination.code, originType: origin.type, destinationType: destination.type, depart: String(form.get("depart") || ""), returnDate: roundTrip ? String(form.get("returnDate") || "") : undefined, adults: Number(form.get("adults")), cabin: String(form.get("cabin")) };
    controller.current?.abort();
    const active = new AbortController(); controller.current = active;
    const timeout = setTimeout(() => active.abort(), 35000);
    setLoading(true); setError(""); setResult(null); setQueryChanged(false);
    try {
      const response = await fetch("/api/flights/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request), signal: active.signal });
      const data = await response.json();
      if (controller.current !== active) return;
      active.signal.throwIfAborted();
      if (!response.ok) throw new Error(data.error || "No pudimos buscar vuelos.");
      const offers: FlightOffer[] = data.offers ?? [];
      if (!offers.every(offer => matchesDepartureDates(offer, request))) throw new Error("No pudimos confirmar vuelos para las fechas elegidas. Vuelve a buscar.");
      setResult({ offers, live: data.live_mode === true, request }); setNow(Date.now()); setCurrency(offers[0]?.total_currency ?? ""); setAirline(""); setStops("any"); setSort("price"); setLimit(12);
      requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }));
    } catch (cause) { if (controller.current === active) setError(active.signal.aborted ? "La búsqueda tardó más de lo esperado. Intenta de nuevo." : cause instanceof Error ? cause.message : "No pudimos conectar. Revisa tu conexión e intenta de nuevo."); }
    finally { clearTimeout(timeout); if (controller.current === active) setLoading(false); }
  }
  return <div className="flight-discovery">
    <form onSubmit={submit} onInputCapture={invalidateResults} onChangeCapture={invalidateResults} className="journey-search" aria-label="Buscar vuelos">
      <div className="journey-search-top"><div className="journey-trip-type" role="group" aria-label="Tipo de viaje"><button type="button" aria-pressed={roundTrip} onClick={() => { if (!roundTrip) invalidateResults(); setRoundTrip(true); }} disabled={loading}>Ida y vuelta</button><button type="button" aria-pressed={!roundTrip} onClick={() => { if (roundTrip) invalidateResults(); setRoundTrip(false); }} disabled={loading}>Solo ida</button></div><span className="journey-search-label"><Plane size={16} aria-hidden />Tu viaje empieza aquí</span></div>
      <div className="journey-locations"><AirportField label="Origen" value={origin} onChange={value => { invalidateResults(); setOrigin(value); }} disabled={loading} /><button type="button" className="journey-swap" aria-label="Intercambiar origen y destino" disabled={loading} onClick={() => { invalidateResults(); setOrigin(destination); setDestination(origin); }}><Repeat size={20} aria-hidden /></button><AirportField label="Destino" value={destination} onChange={value => { invalidateResults(); setDestination(value); }} disabled={loading} /></div>
      <div className="journey-options"><label><span><CalendarDays size={16} aria-hidden />Salida</span><input type="date" name="depart" aria-label="Fecha de salida" min={today} required disabled={loading} onInput={event => setDepart(event.currentTarget.value)} /></label>
        <label className={!roundTrip ? "is-disabled" : undefined}><span><CalendarDays size={16} aria-hidden />Regreso</span>{roundTrip ? <input type="date" name="returnDate" aria-label="Fecha de regreso" min={depart || today} required disabled={loading} /> : <span className="journey-oneway">Viaje de una sola ida</span>}</label>
        <label><span><Users size={16} aria-hidden />Viajeros</span><select name="adults" aria-label="Adultos" defaultValue="1" disabled={loading}>{Array.from({ length: 9 }, (_, index) => <option key={index} value={index + 1}>{index + 1} adulto{index ? "s" : ""}</option>)}</select></label>
        <label><span>Cabina</span><select name="cabin" aria-label="Cabina" defaultValue="economy" disabled={loading}><option value="economy">Económica</option><option value="premium_economy">Económica premium</option><option value="business">Ejecutiva</option><option value="first">Primera clase</option></select></label>
      </div>
      <div className="journey-search-bottom"><p>{ready ? "Consulta y compara. La compra de boletos estará disponible próximamente." : "Estamos preparando la búsqueda de vuelos."}</p><button className="journey-search-button" disabled={!ready || loading}>{loading ? "Buscando vuelos…" : "Buscar vuelos"}<ArrowRight size={19} aria-hidden /></button></div>
      {error ? <p role="alert" className="journey-error">{error}</p> : null}
    </form>
    <section ref={resultsRef} className="journey-results" aria-label="Resultados de vuelos" aria-busy={loading}>
      {queryChanged && !loading ? <p className="journey-search-updated" role="status">Actualizaste tu búsqueda. Pulsa «Buscar vuelos» para consultar las fechas y opciones que elegiste.</p> : null}
      {loading ? <div className="journey-loading" role="status"><div className="journey-flight-loader" aria-hidden><span /><Plane size={28} /></div><h2>Tu próximo viaje está tomando forma.</h2><p>Consultando horarios y tarifas de las aerolíneas…</p><div className="journey-skeletons" aria-hidden>{[0, 1, 2].map(index => <div key={index}><i /><span /><b /></div>)}</div></div> : null}
      {result && !loading ? <>
        <div className="journey-result-heading"><div><p className="journey-eyebrow">{result.live ? "VUELOS PARA TU VIAJE" : "RESULTADOS DE PRUEBA"}</p><h2>{result.request.origin}<ArrowRight size={23} aria-hidden />{result.request.destination}</h2><p>{localDateLabel(result.request.depart)}{result.request.returnDate ? ` — ${localDateLabel(result.request.returnDate)}` : " · Solo ida"} · {result.request.adults} adulto{result.request.adults > 1 ? "s" : ""}</p></div><span className="journey-result-count" role="status">{filtered.length} opciones</span></div>
        {logos.length ? <div className="journey-airlines" aria-label="Aerolíneas en tus resultados">{logos.map(item => <span key={item.name}><AirlineMark airline={item} /><span>{item.name}</span></span>)}</div> : null}
        {result.offers.length ? <>
          <div className="journey-sort" role="group" aria-label="Ordenar vuelos"><button aria-pressed={sort === "price"} onClick={() => { setSort("price"); setLimit(12); }}><span>Menor precio</span><strong>{cheapest !== null ? priceLabel(cheapest, currency) : "—"}</strong></button><button aria-pressed={sort === "duration"} onClick={() => { setSort("duration"); setLimit(12); }}><span>Menos tiempo de viaje</span><strong>{quickest !== null ? durationLabel(quickest) : "—"}</strong></button><button aria-pressed={sort === "departure"} onClick={() => { setSort("departure"); setLimit(12); }}><span>Salida más temprano</span><strong>Organiza tu día</strong></button></div>
          <div className="journey-filters"><label>Escalas<select value={stops} onChange={event => { setStops(event.target.value as OfferFilters["stops"]); setLimit(12); }}><option value="any">Todas las opciones</option><option value="0">Sólo sin escalas</option><option value="1">Máximo una escala</option></select></label><label>Aerolínea<select value={airline} onChange={event => { setAirline(event.target.value); setLimit(12); }}><option value="">Todas las aerolíneas</option>{airlines.map(name => <option key={name}>{name}</option>)}</select></label>{currencies.length > 1 ? <label>Moneda<select value={currency} onChange={event => { setCurrency(event.target.value); setLimit(12); }}>{currencies.map(code => <option key={code}>{code}</option>)}</select></label> : <p>Precios en {currency} · total para todos los adultos</p>}</div>
        </> : null}
        {filtered.length ? <><div className="journey-offers">{filtered.slice(0, limit).map(offer => <FlightCard key={offer.id} offer={offer} adults={result.request.adults} bestPrice={Number(offer.total_amount) === cheapest} />)}</div>{filtered.length > limit ? <button className="journey-more" onClick={() => setLimit(value => value + 12)}>Ver más vuelos · {filtered.length - limit} por explorar<ArrowRight size={17} aria-hidden /></button> : null}</> : <div className="journey-empty"><Plane size={30} aria-hidden /><h3>No hay vuelos para esta selección.</h3><p>{result.offers.length ? "Prueba otros filtros. Si pasó un rato desde tu consulta, vuelve a buscar para actualizar las tarifas." : "Prueba con otras fechas o un aeropuerto cercano."}</p>{stops !== "any" || airline ? <button onClick={() => { setStops("any"); setAirline(""); }}>Quitar filtros</button> : null}</div>}
      </> : null}
    </section>
  </div>;
}
