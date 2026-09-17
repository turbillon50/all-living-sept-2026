"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, MapPin, Star } from "@/ui/icons";
import { DESTINATIONS, type SearchInput, type SearchResult } from "@/integrations/viator/catalog";
import styles from "./experiences.module.css";

const initial: SearchInput = { destination: "631", q: "", date: "", sort: "recommended", cancellation: "all", page: 1 };
const money = (value: number, currency: string) => `${new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 }).format(value)} ${currency}`;

export function ExperienceSearch() {
  const [form, setForm] = useState(initial);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(initial);
  const pending = useRef<AbortController | null>(null);
  const search = useCallback(async (input: SearchInput) => {
    pending.current?.abort();
    const controller = new AbortController(); pending.current = controller;
    setLoading(true); setError(""); setSubmitted(input);
    try {
      const query = new URLSearchParams({ ...input, page: String(input.page) });
      const response = await fetch(`/api/viator/search?${query}`, { signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No pudimos consultar las experiencias.");
      if (!controller.signal.aborted) setResult(data as SearchResult);
    } catch (failure) {
      if (!controller.signal.aborted) { setError(failure instanceof Error ? failure.message : "La conexión se interrumpió. Intenta de nuevo."); setResult(null); }
    } finally { if (!controller.signal.aborted) setLoading(false); }
  }, []);
  useEffect(() => { void search(initial); return () => pending.current?.abort(); }, [search]);
  const destination = DESTINATIONS.find(item => item.id === submitted.destination)?.name;
  return <div className={styles.experiences}>
    <form className={styles.search} onSubmit={event => { event.preventDefault(); void search({ ...form, page: 1 }); }}>
      <label>Destino<select value={form.destination} onChange={event => setForm({ ...form, destination: event.target.value as SearchInput["destination"] })}>{DESTINATIONS.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>¿Qué quieres vivir?<input type="search" maxLength={100} placeholder="Cenotes, snorkel, Chichén Itzá…" value={form.q} onChange={event => setForm({ ...form, q: event.target.value })} /></label>
      <label>Fecha · opcional<input type="date" value={form.date} onChange={event => setForm({ ...form, date: event.target.value })} /></label>
      <button className={styles.primary} type="submit" disabled={loading}>{loading ? "Buscando…" : "Buscar experiencias"}<ArrowRight size={18} aria-hidden /></button>
      <div className={styles.filters}>
        <label>Ordenar por<select value={form.sort} onChange={event => setForm({ ...form, sort: event.target.value as SearchInput["sort"] })}><option value="recommended">Destacados de Viator</option><option value="price">Precio base: menor a mayor</option><option value="rating">Mejor calificación</option></select></label>
        <label className={styles.checkbox}><input type="checkbox" checked={form.cancellation === "free"} onChange={event => setForm({ ...form, cancellation: event.target.checked ? "free" : "all" })} /> Con cancelación gratuita</label>
        <span>Reserva y pago en Viator <ArrowRight size={14} aria-hidden /></span>
      </div>
    </form>
    <div className={styles.heading}><div><p className={styles.eyebrow}><MapPin size={14} aria-hidden />{destination}</p><h2>Un plan para recordar.</h2></div><p role="status" aria-live="polite">{loading ? "Consultando experiencias…" : result ? `${result.total.toLocaleString("es-MX")} experiencias${submitted.q ? ` para “${submitted.q}”` : ""}${submitted.date ? ` · ${submitted.date}` : ""}` : ""}</p></div>
    {result?.mode === "sandbox" && !loading ? <p className={styles.notice}>Entorno de pruebas: este catálogo y sus enlaces no realizan reservas de producción.</p> : null}
    <section aria-label="Resultados de experiencias" aria-busy={loading}>
      {loading ? <div className={styles.grid} aria-hidden>{Array.from({ length: 6 }, (_, index) => <div className={styles.skeleton} key={index}><div /><span /><span /></div>)}</div>
        : error ? <div className={styles.empty} role="alert"><h3>No pudimos cargar las experiencias.</h3><p>{error}</p><button className={styles.primary} onClick={() => void search(submitted)}>Volver a intentar</button></div>
          : result?.items.length === 0 ? <div className={styles.empty}><h3>No encontramos experiencias con estos filtros.</h3><p>Prueba otra fecha o busca algo diferente.</p><button className={styles.primary} onClick={() => { setForm({ ...initial, destination: submitted.destination }); void search({ ...initial, destination: submitted.destination }); }}>Quitar filtros</button></div>
            : <ul className={styles.grid}>{result?.items.map(item => <li key={item.id} className={styles.card}>
              <a className={styles.photo} href={item.url} target="_blank" rel="sponsored noopener noreferrer" aria-label={`Ver ${item.title} en Viator`}>{item.image ? <Image src={item.image} alt={item.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" unoptimized /> : <span>Explora esta experiencia</span>}{item.freeCancellation ? <span className={styles.badge}>Cancelación gratuita</span> : null}</a>
              <div className={styles.body}>
                {item.rating !== null && item.reviewCount > 0 ? <p className={styles.rating}><Star size={15} aria-hidden /><strong>{item.rating.toFixed(1)}</strong><span>({item.reviewCount.toLocaleString("es-MX")})</span><span className={styles.sources}>{item.reviewSources.join(" y ")}</span></p> : null}
                <h3><a href={item.url} target="_blank" rel="sponsored noopener noreferrer">{item.title}</a></h3>
                {item.duration ? <p className={styles.duration}>{item.duration} de experiencia</p> : null}
                <p className={styles.description}>{item.description}</p>
                <div className={styles.price}><span>Desde</span><strong>{item.fromPrice !== null && item.currency ? money(item.fromPrice, item.currency) : "Consultar en Viator"}</strong></div>
                {item.extraCharges !== null && item.extraCharges > 0 && item.currency ? <p className={styles.charges}>Incluye hasta {money(item.extraCharges, item.currency)} de cargos a pagar en destino. Revisa las condiciones.</p> : null}
                <a className={styles.link} href={item.url} target="_blank" rel="sponsored noopener noreferrer">Ver y reservar en Viator<ArrowRight size={17} aria-hidden /></a>
              </div>
            </li>)}</ul>}
    </section>
    {result && !loading && result.pages > 1 ? <nav className={styles.pagination} aria-label="Páginas de experiencias"><button disabled={result.page <= 1} onClick={() => void search({ ...submitted, page: result.page - 1 })}>Anterior</button><span>Página {result.page} de {result.pages}</span><button disabled={result.page >= result.pages} onClick={() => void search({ ...submitted, page: result.page + 1 })}>Siguiente</button></nav> : null}
    <p className={styles.disclosure}>Experiencias publicadas por Viator. Los precios son orientativos y pueden cambiar según fecha, opción y viajeros. Confirma disponibilidad, cargos y cancelaciones antes de pagar en Viator. All Living puede recibir una comisión por las reservas realizadas desde estos enlaces.</p>
  </div>;
}
