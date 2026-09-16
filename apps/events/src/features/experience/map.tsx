"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin, MapTrifold, NavigationArrow, Sparkle } from "@phosphor-icons/react";
import { CITIES, DEMO_EVENTS, currency, type ExperienceEvent } from "./catalog";
import { useExperience } from "./provider";
import { Empty, EventTile, PageTitle } from "./primitives";
import { useLiveCatalog } from "./use-catalog";
import "leaflet/dist/leaflet.css";
import s from "./experience.module.css";

function EventMap({ events, city, onSelect }: { events: ExperienceEvent[]; city: string; onSelect: (id: string) => void }) {
  const container = useRef<HTMLDivElement>(null); const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false; let map: import("leaflet").Map | undefined;
    import("leaflet").then(L => {
      if (cancelled || !container.current) return;
      const center = CITIES.find(c => c.id === city) ?? CITIES[0];
      map = L.map(container.current, { scrollWheelZoom: false, zoomControl: true }).setView([...center.coordinates], city === "all" ? 9 : 13);
      const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors' }).addTo(map);
      let failures = 0; tiles.on("tileerror", () => { failures++; if (failures > 3) setFailed(true); });
      events.filter(e => e.coordinates).forEach(event => {
        const label = document.createElement("span"); label.textContent = event.price === null ? "Ver plan" : currency(event.price, event.currency);
        const marker = L.marker(event.coordinates!, { icon: L.divIcon({ html: label, className: "event-map-pin", iconSize: [82, 37], iconAnchor: [41, 37] }), title: event.title, alt: `Ver ${event.title}` }).addTo(map!);
        marker.on("click", () => { onSelect(event.id); map?.panTo(event.coordinates!); });
      });
    }).catch(() => setFailed(true));
    return () => { cancelled = true; map?.remove(); };
  }, [events, city, onSelect]);
  return <><div ref={container} className={s.mapCanvas} role="region" aria-label="Mapa interactivo de eventos. También puedes elegir eventos en la lista." />{failed && <p className={s.mapError} role="status">Algunas partes del mapa no pudieron cargarse. Puedes seguir explorando los eventos en la lista.</p>}</>;
}
export function MapPage() {
  const { state } = useExperience(); const demo = state.mode === "demo";
  const [city, setCity] = useState("all"); const [selected, setSelected] = useState<string>(DEMO_EVENTS[0].id); const [enabled, setEnabled] = useState(false);
  const live = useLiveCatalog(!demo, `city=${city}`);
  const source = demo ? DEMO_EVENTS : live.events;
  const events = source.filter(event => city === "all" || event.city === city);
  // A stable signature avoids recreating the map when only the selected card changes.
  const signature = events.map(e => e.id).join(",");
  const stableEvents = useRef(events); if (stableEvents.current.map(e => e.id).join(",") !== signature) stableEvents.current = events;
  const chosen = events.find(event => event.id === selected) ?? events[0];
  const select = useCallback((id: string) => setSelected(id), []);
  return <><PageTitle eyebrow="EL CARIBE TIENE MUCHAS FORMAS DE VIVIRSE" title="Tu ciudad. Tu mapa. Tu plan."><span className={s.locationPill}><NavigationArrow size={18} />Quintana Roo</span></PageTitle><div className={s.mapToolbar}><div className={s.categoryTabs}>{CITIES.map(c => <button key={c.id} aria-pressed={city === c.id} onClick={() => setCity(c.id)}><MapPin size={16} />{c.short}</button>)}</div><span>{events.length} planes {demo ? "de muestra" : "publicados"}</span></div>{demo && <p className={s.demoNotice}><Sparkle size={16} />Pines, recintos y precios ilustrativos de la demo. No son presentaciones confirmadas.</p>}{live.error && !demo && <div className={s.errorNotice} role="alert"><p>{live.error}</p><button className={s.secondary} onClick={live.retry}>Reintentar</button></div>}
  <div className={s.mapLayout}><aside className={s.mapList} aria-label="Eventos del mapa">{!demo && live.loading ? <div className={s.skeleton} /> : events.length ? <><p className={s.eyebrow}>ENCUENTRA TU PUNTO DE ENCUENTRO</p>{events.map(event => <button className={s.mapListItem} data-active={chosen?.id === event.id} onClick={() => setSelected(event.id)} key={event.id}><span style={{ backgroundImage: `url("${event.image}")` }} /><div><small>{event.cityLabel} · {demo ? "DEMO" : "Ticketmaster"}</small><strong>{event.title}</strong><p>{event.genre}</p></div><ArrowUpRight size={18} /></button>)}{chosen && <EventTile event={chosen} compact />}</> : <Empty title="Pronto, más puntos en el mapa." text={demo ? "Prueba otra ciudad." : "Sin eventos publicados para estos filtros. Los eventos sin coordenadas se pueden consultar en la cartelera."} href="/app" action="Ver cartelera" />}</aside><div className={s.mapSurface}>{enabled ? <EventMap events={stableEvents.current} city={city} onSelect={select} /> : <div className={s.mapConsent}><div className={s.mapPattern} aria-hidden /><span className={s.mapConsentIcon}><MapTrifold size={48} weight="duotone" /></span><h2>Todo un Caribe<br /><em>por descubrir.</em></h2><p>Abre el mapa interactivo y encuentra los eventos por ciudad.</p><button className={s.primary} onClick={() => setEnabled(true)}>Abrir mapa <ArrowUpRight size={18} /></button><small>Se cargarán mapas de OpenStreetMap. Su proveedor recibirá datos técnicos, como tu IP. <Link href="/privacidad">Ver privacidad</Link></small></div>}<span className={s.mapFloatingLabel}><i />{demo ? "MAPA DE DEMOSTRACIÓN" : "UBICACIONES PUBLICADAS POR TICKETMASTER"}</span></div></div></>;
}
