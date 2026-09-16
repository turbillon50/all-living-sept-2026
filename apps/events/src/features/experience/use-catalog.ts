"use client";
import { useEffect, useState } from "react";
import type { PlaceEvents } from "@/lib/ticketmaster";
import { fromTicketmaster, type ExperienceEvent } from "./catalog";
import { useExperience } from "./provider";

export function useLiveCatalog(enabled: boolean, query = "") {
  const { setLiveEvents } = useExperience();
  const [events, setEvents] = useState<ExperienceEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revision, retry] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setLoading(true); setError(""); setEvents([]);
    fetch(`/api/events?${query}`, { signal: controller.signal }).then(async response => {
      const data = await response.json() as { ok: boolean; places?: PlaceEvents[] };
      if (!Array.isArray(data.places)) throw new Error("Respuesta no disponible");
      const found = data.places.flatMap(place => place.isLive ? place.events.map(event => fromTicketmaster(event, place.place)) : []);
      const unique = Array.from(new Map(found.map(event => [event.id, event])).values());
      setEvents(unique);
      setLiveEvents(previous => Array.from(new Map([...previous, ...unique].map(event => [event.id, event])).values()).slice(-300));
      if (!response.ok || !data.ok) setError("No pudimos consultar toda la cartelera de Ticketmaster. Intenta nuevamente; esto no significa que no haya eventos.");
    }).catch(error => {
      if (error.name !== "AbortError") setError("No pudimos conectar con la cartelera. Revisa tu conexión y vuelve a intentar.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [enabled, query, revision, setLiveEvents]);
  return { events, loading, error, retry: () => retry(value => value + 1) };
}
