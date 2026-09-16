"use client";
import { useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, MapPin, CalendarDots, ArrowRight, CircleNotch } from "@phosphor-icons/react";
import styles from "./events.module.css";

export function EventsSearch({ q, city, date, category }: { q: string; city: string; date: string; category: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of data) if (typeof value === "string" && value.trim() && value !== "all") params.set(key, value.trim());
    startTransition(() => router.push(`/eventos${params.size ? `?${params}` : ""}#cartelera`));
  }
  return <form className={styles.search} onSubmit={search} action="/eventos" method="get" role="search" aria-label="Buscar eventos" aria-busy={pending}>
    <label className={styles.searchField}><MagnifyingGlass size={22} weight="duotone" aria-hidden /><span><span>¿Qué quieres vivir?</span><input name="q" defaultValue={q} maxLength={80} placeholder="Artista, equipo o espectáculo" autoComplete="off" /></span></label>
    <label className={styles.searchField}><MapPin size={22} weight="duotone" aria-hidden /><span><span>¿Dónde?</span><select name="city" defaultValue={city}><option value="all">Todo Quintana Roo</option><option value="cancun">Cancún</option><option value="playa-del-carmen">Playa del Carmen</option><option value="tulum">Tulum</option></select></span></label>
    <label className={styles.searchField}><CalendarDots size={22} weight="duotone" aria-hidden /><span><span>A partir de</span><input type="date" name="date" defaultValue={date} aria-label="Eventos a partir de" /></span></label>
    <input type="hidden" name="category" value={category} />
    <button type="submit" disabled={pending}>{pending ? <CircleNotch size={18} className={styles.spinner} aria-hidden /> : <ArrowRight size={18} aria-hidden />}{pending ? "Buscando…" : "Buscar eventos"}</button>
  </form>;
}

export function RetryCatalog() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button type="button" className={styles.textLink} disabled={pending} onClick={() => startTransition(() => router.refresh())}>{pending ? "Reconectando…" : "Volver a consultar"}<ArrowRight size={16} aria-hidden /></button>;
}
