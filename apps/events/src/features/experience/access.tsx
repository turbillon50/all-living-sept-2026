"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check, Sparkle, Compass, Heart, Ticket } from "@phosphor-icons/react";
import { Mark } from "@/ui/mark";
import { useExperience } from "./provider";
import s from "./experience.module.css";

export function Access() {
  const router = useRouter(); const { state, setState } = useExperience();
  const [name, setName] = useState("");
  function enter(event: React.FormEvent) {
    event.preventDefault();
    const displayName = name.trim() || (state.signedIn ? state.profile.name : "Alex Rivera");
    setState(old => ({ ...old, signedIn: true, mode: "demo", profile: { ...old.profile, name: displayName, avatar: displayName.split(/\s+/).map(word => word[0]).slice(0, 2).join("").toUpperCase() } }));
    router.push("/app");
  }
  return <div className={s.access}><header className={s.accessHeader}><Link href="/eventos" className={s.logo}><Mark size={36} /><span>ALL LIVING<small>EVENTOS</small></span></Link><Link href="/eventos">Volver a la portada <ArrowUpRight size={15} /></Link></header><main className={s.accessGrid}>
    <section className={s.accessArt}><Image src="/events/demo/festival.webp" alt="Luces y energía de un concierto" fill priority sizes="(max-width: 850px) 100vw, 55vw" /><div className={s.accessArtTop}><span>HECHO PARA VIVIRLO.</span><Sparkle size={30} weight="duotone" /></div><div className={s.accessArtCopy}><span className={s.glassPill}>CANCÚN · PLAYA · TULUM</span><h1>Menos después.<br />Más <em>ahí estuvimos.</em></h1><p>Encuentra tu ritmo, reúne a tu gente<br />y hazle espacio a la próxima gran noche.</p><div className={s.accessMiniTicket}><Ticket size={30} weight="duotone" /><div><strong>Tu siguiente recuerdo</strong><small>Te está esperando del otro lado.</small></div><ArrowUpRight size={23} /></div></div></section>
    <section className={s.accessForm}><span className={s.eyebrow}><span className={s.liveDot} /> EL PLAN EMPIEZA CONTIGO</span><h2>Qué bueno<br />que <em>llegaste.</em></h2><p>Entra, explora y prueba cada detalle de tu próxima experiencia.</p><div className={s.demoAccessLabel}><Sparkle size={17} weight="fill" /> Acceso independiente · modo demo</div><form onSubmit={enter}><label className={s.field}>¿Cómo te decimos?<input value={name} onChange={e => setName(e.target.value)} maxLength={60} placeholder="Tu apodo, por ejemplo: Luis" autoComplete="off" /></label><p className={s.microcopy}>Usa un apodo o entra como Alex. No necesitas correo, contraseña ni una cuenta de All Living.</p><button className={s.primary} type="submit">{state.signedIn ? "Volver a entrar a la demo" : "Entrar a la demo"}<ArrowRight size={19} /></button></form><div className={s.accessBenefits}><span><Compass size={17} />Descubre</span><span><Heart size={17} />Guarda</span><span><Ticket size={17} />Arma tu plan</span></div><div className={s.accessDisclaimer}><Check size={17} /><p>Perfil guardado sólo en este navegador. Los eventos, el carrito y el pago de la demo son ejemplos, sin cobros ni reservas reales.</p></div><Link href="/app" className={s.accessGuest} onClick={() => setState(old => ({ ...old, mode: "live" }))}>Explorar eventos reales sin entrar <ArrowUpRight size={16} /></Link><p className={s.microcopy}>Consulta nuestro <Link href="/privacidad">Aviso de Privacidad</Link> y los <Link href="/terminos">Términos de Uso</Link>.</p></section>
  </main><footer className={s.accessFooter}>Una experiencia de ALL LIVING Eventos · Colectivo Mass S.A. de C.V.</footer></div>;
}
