"use client";

import { SignIn, SignUp, UserProfile } from "@clerk/nextjs";
import { useEventsAccount } from "./account-context";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "@phosphor-icons/react";
import { PageTitle } from "./primitives";
import s from "./experience.module.css";


export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const account = useEventsAccount();
  if (!account.available) return <div className={s.authUnavailable} role="status"><ShieldCheck size={27} weight="duotone" /><h3>Estamos preparando tu acceso.</h3><p>El registro estará disponible pronto. Mientras tanto, puedes descubrir eventos y recorrer la demo.</p><Link href="/app" className={s.primary}>Explorar eventos <ArrowRight size={18} /></Link></div>;
  if (account.signedIn) return <div className={s.authWelcome}><span className={s.profileAvatar}>{account.initials}</span><h3>Ya estás dentro, {account.name.split(" ")[0]}.</h3><Link href="/app" className={s.primary}>Ir a mi experiencia <ArrowRight size={18} /></Link><Link href="/app/cuenta" className={s.accessGuest}>Administrar mi cuenta</Link></div>;
  return <div className={s.authForm}>{mode === "sign-up" ? <SignUp path="/registro" routing="path" signInUrl="/iniciar-sesion" forceRedirectUrl="/app" /> : <SignIn path="/iniciar-sesion" routing="path" signUpUrl="/registro" forceRedirectUrl="/app" />}</div>;
}

export function RealAccountPage() {
  const account = useEventsAccount();
  return <><PageTitle eyebrow="TU CUENTA DE EVENTOS" title="Tu acceso. Bajo tu control."><Link href="/app/perfil" className={s.secondary}>Volver a mi perfil</Link></PageTitle>{!account.loaded ? <p role="status" className={s.infoPanel}>Cargando tu cuenta…</p> : account.signedIn ? <div className={s.accountManager}><UserProfile path="/app/cuenta" routing="path" /></div> : <section className={s.panel}><ShieldCheck size={34} weight="duotone" /><h2>Un lugar para ti.</h2><p className={s.bodyCopy}>Crea tu cuenta de Eventos para administrar tu perfil, correo y seguridad. Puedes seguir explorando sin registrarte.</p><div className={s.authActions}><Link href="/registro" className={s.primary}>Crear mi cuenta <ArrowRight size={18} /></Link><Link href="/iniciar-sesion" className={s.secondary}>Ya tengo cuenta</Link></div></section>}<p className={s.microcopy}>La cuenta pertenece exclusivamente a ALL LIVING Eventos. El carrito y los planes de muestra siguen siendo una simulación; las compras reales se completan en Ticketmaster.</p></>;
}
