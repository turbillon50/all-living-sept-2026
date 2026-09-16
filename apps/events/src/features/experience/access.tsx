"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Sparkle, Compass, Heart, Ticket, ShieldCheck } from "@phosphor-icons/react";
import { Mark } from "@/ui/mark";
import { useExperience } from "./provider";
import { AuthForm } from "./auth";
import { useEventsAccount } from "./account-context";
import s from "./experience.module.css";

export function Access({ mode = "welcome" }: { mode?: "welcome" | "sign-in" | "sign-up" }) {
  const router = useRouter();
  const { state, setState } = useExperience();
  const account = useEventsAccount();
  const [name, setName] = useState("");
  function enterDemo(event: React.FormEvent) {
    event.preventDefault();
    const displayName = name.trim() || (state.signedIn ? state.profile.name : "Alex Rivera");
    setState(old => ({ ...old, signedIn: true, mode: "demo", profile: { ...old.profile, name: displayName, avatar: displayName.split(/\s+/).map(word => word[0]).slice(0, 2).join("").toUpperCase() } }));
    router.push("/app");
  }
  return <div className={s.access}>
    <header className={s.accessHeader}><Link href="/eventos" className={s.logo}><Mark size={36} /><span>ALL LIVING<small>EVENTOS</small></span></Link><Link href="/eventos">Volver a la portada <ArrowUpRight size={15} /></Link></header>
    <main className={s.accessGrid}>
      <section className={s.accessArt}><Image src="/events/demo/festival.webp" alt="Luces y energía de un concierto" fill priority sizes="(max-width: 850px) 100vw, 55vw" /><div className={s.accessArtTop}><span>HECHO PARA VIVIRLO.</span><Sparkle size={30} weight="duotone" /></div><div className={s.accessArtCopy}><span className={s.glassPill}>CANCÚN · PLAYA · TULUM</span><h1>Menos después.<br />Más <em>ahí estuvimos.</em></h1><p>Encuentra tu ritmo, reúne a tu gente<br />y hazle espacio a la próxima gran noche.</p><div className={s.accessMiniTicket}><Ticket size={30} weight="duotone" /><div><strong>Tu siguiente recuerdo</strong><small>Te está esperando del otro lado.</small></div><ArrowUpRight size={23} /></div></div></section>
      <section className={s.accessForm}>
        <span className={s.eyebrow}><span className={s.liveDot} /> EL PLAN EMPIEZA CONTIGO</span>
        <h2>{mode === "sign-up" ? <>Tu próxima<br /><em>gran historia.</em></> : mode === "sign-in" ? <>Qué gusto<br /><em>verte de nuevo.</em></> : <>Qué bueno<br />que <em>llegaste.</em></>}</h2>
        <p>{mode === "sign-up" ? "Crea tu cuenta y haz de Eventos tu lugar para salir a vivir." : mode === "sign-in" ? "Entra a tu cuenta de ALL LIVING Eventos." : "Descubre lo que viene. Encuentra tu ritmo. Hazlo tuyo."}</p>
        {mode !== "welcome" ? <AuthForm mode={mode} /> : account.signedIn ? <div className={s.authActions}><Link href="/app" className={s.primary}>Continuar como {account.name.split(" ")[0]} <ArrowRight size={18} /></Link><Link href="/app/cuenta" className={s.secondary}>Administrar mi cuenta</Link></div> : <div className={s.authActions}><Link href="/registro" className={s.primary}>Crear mi cuenta <ArrowRight size={18} /></Link><Link href="/iniciar-sesion" className={s.secondary}>Ya tengo cuenta · entrar</Link></div>}
        <div className={s.accessBenefits}><span><Compass size={17} />Descubre</span><span><Heart size={17} />Guarda</span><span><Ticket size={17} />Arma tu plan</span></div>
        <Link href="/app" className={s.accessGuest} onClick={() => setState(old => ({ ...old, mode: "live" }))}>Explorar eventos reales sin registrarme <ArrowUpRight size={16} /></Link>
        {mode === "welcome" && <details className={s.demoEntry}><summary><Sparkle size={16} />Quiero recorrer la demo</summary><form onSubmit={enterDemo}><label className={s.field}>¿Cómo te decimos?<input value={name} onChange={e => setName(e.target.value)} maxLength={60} placeholder="Tu apodo, por ejemplo: Luis" autoComplete="off" /></label><p className={s.microcopy}>La demo guarda ejemplos en este navegador. No crea una cuenta ni cobra o reserva boletos.</p><button className={s.secondary} type="submit">Entrar a la demo <ArrowRight size={17} /></button></form></details>}
        <div className={s.accessDisclaimer}><ShieldCheck size={18} /><p>Una cuenta exclusiva de Eventos. Las compras reales se completan directamente en Ticketmaster.</p></div>
        <p className={s.microcopy}>Consulta nuestro <Link href="/privacidad">Aviso de Privacidad</Link> y los <Link href="/terminos">Términos de Uso</Link>.</p>
      </section>
    </main>
    <footer className={s.accessFooter}>Una experiencia de ALL LIVING Eventos · Colectivo Mass S.A. de C.V.</footer>
  </div>;
}
