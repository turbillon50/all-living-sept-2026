"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, ArrowUpRight, X, SpotifyLogo, Play, Ticket, CheckCircle, MusicNotes } from "@phosphor-icons/react";
import { currency, eventDate, type ExperienceEvent } from "./catalog";
import { useExperience } from "./provider";
import s from "./experience.module.css";

export function Modal({ open, close, title, children, drawer = false }: { open: boolean; close: () => void; title: string; children: React.ReactNode; drawer?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (open) ref.current?.showModal(); else ref.current?.close(); }, [open]);
  return <dialog ref={ref} onClose={close} onClick={e => { if (e.target === e.currentTarget) close(); }} className={drawer ? s.drawer : s.dialog} aria-label={title}><div className={s.dialogHead}><h2>{title}</h2><button className={s.iconButton} onClick={close} aria-label="Cerrar"><X size={22} /></button></div>{children}</dialog>;
}
export function FavoriteButton({ event }: { event: ExperienceEvent }) {
  const { state, setState, notify } = useExperience(); const saved = state.favorites.includes(event.id);
  return <button className={s.favoriteButton} data-active={saved} aria-label={`${saved ? "Quitar de" : "Guardar en"} favoritos: ${event.title}`} aria-pressed={saved} onClick={() => { setState(old => ({ ...old, favorites: saved ? old.favorites.filter(id => id !== event.id) : [...old.favorites, event.id] })); notify(saved ? "Evento retirado de tus favoritos" : "Un buen plan, guardado para después"); }}><Heart size={19} weight={saved ? "fill" : "regular"} /></button>;
}
export function EventTile({ event, compact = false }: { event: ExperienceEvent; compact?: boolean }) {
  return <article className={`${s.eventTile} ${compact ? s.compactTile : ""}`}>
    <div className={s.tileImage}><Link href={`/app/evento/${encodeURIComponent(event.id)}`} aria-label={`Ver ${event.title}`}><Image src={event.image} alt="" fill sizes="(max-width: 600px) 88vw, (max-width: 1100px) 45vw, 30vw" unoptimized={event.source === "ticketmaster"} /></Link><span className={s.tileBadge}>{event.source === "demo" ? "DEMO" : "TICKETMASTER"}</span><FavoriteButton event={event} /><span className={s.tileDate}>{eventDate(event.date)}</span><span className={s.tileGenre}>{event.genre}</span></div>
    <div className={s.tileBody}><span className={s.tileCity}><MapPin size={12} />{event.cityLabel}</span><Link href={`/app/evento/${encodeURIComponent(event.id)}`}><h3>{event.title}</h3></Link><p>{event.venue}</p><div className={s.tileBottom}><span>{event.price === null ? "Consultar precio" : <><small>Desde </small>{currency(event.price, event.currency)} <small>{event.currency}</small></>}<em>{event.source === "demo" ? "Precio de ejemplo" : "Precio publicado"}</em></span><Link href={`/app/evento/${encodeURIComponent(event.id)}`} aria-label={`Detalles de ${event.title}`}><ArrowUpRight size={19} /></Link></div></div>
  </article>;
}
export function SpotifyPlayer({ event }: { event: ExperienceEvent }) {
  const [open, setOpen] = useState(false);
  if (!event.spotifyId) return <div className={s.musicPlaceholder}><MusicNotes size={26} /><div><strong>Primero, siente el ambiente.</strong><p>Este evento no tiene un enlace de artista en Spotify.</p></div></div>;
  return <div className={s.spotifyPanel}><div className={s.spotifyHead}><SpotifyLogo size={25} /><div><strong>{event.artist}</strong><p>Escucha antes de elegir tu plan</p></div>{!open && <button className={s.playRound} aria-label={`Escuchar a ${event.artist} en Spotify`} onClick={() => setOpen(true)}><Play size={19} weight="fill" /></button>}</div>{open ? <><iframe title={`Spotify · ${event.artist}`} src={`https://open.spotify.com/embed/artist/${event.spotifyId}?theme=0`} width="100%" height="352" style={{ border: 0, borderRadius: 14 }} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" /><button className={s.textButton} onClick={() => setOpen(false)}>Cerrar reproductor</button></> : <p className={s.microcopy}>Al reproducir se carga Spotify, sujeto a sus cookies y condiciones. La duración disponible depende de Spotify.</p>}</div>;
}
export function Empty({ title, text, action, href, icon = "ticket" }: { title: string; text: string; action?: string; href?: string; icon?: "ticket" | "heart" }) { return <div className={s.empty}><span>{icon === "heart" ? <Heart size={34} weight="duotone" /> : <Ticket size={34} weight="duotone" />}</span><h2>{title}</h2><p>{text}</p>{action && href ? <Link href={href} className={s.primary}>{action}<ArrowUpRight size={17} /></Link> : null}</div>; }
export function Toast() { const { toast } = useExperience(); return <div className={s.toast} role="status" aria-live="polite" data-visible={Boolean(toast)}>{toast && <><CheckCircle size={19} weight="fill" />{toast}</>}</div>; }
export function PageTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) { return <div className={s.pageTitle}><div><p className={s.eyebrow}>{eyebrow}</p><h1>{title}</h1></div>{children}</div>; }
