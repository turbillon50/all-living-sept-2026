import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, ShieldCheck, Wallet, LifeBuoy, MapPin } from "@/ui/icons";

export const metadata: Metadata = {
  title: "Centro de Confianza",
  description: "Cómo All Living verifica, cobra y protege una estancia.",
};

const blocks = [
  {
    href: "/garantia-all-living",
    Icon: ShieldCheck,
    title: "Garantía All Living",
    body: "Si un alojamiento confirmado falla por una incidencia operativa cubierta, activamos reubicación equivalente o superior, priorizando la zona elegida.",
  },
  {
    href: "/pagos",
    Icon: Wallet,
    title: "Tu dinero, con reglas claras",
    body: "La arquitectura prevista usa Stripe Connect para que el cobro del alojamiento se atribuya al propietario y All Living cobre su comisión de plataforma de forma separada.",
  },
  {
    href: "/terminos",
    Icon: BadgeCheck,
    title: "Alojamientos verificados",
    body: "Identidad, disponibilidad, información del alojamiento y cumplimiento se validan antes de otorgar sellos de confianza.",
  },
  {
    href: "/support",
    Icon: LifeBuoy,
    title: "Soporte durante la estancia",
    body: "Acceso, incidencias, servicios y contingencias se coordinan desde una misma estancia en All Living.",
  },
];

export default function TrustCenter() {
  return (
    <main className="min-h-dvh bg-bg px-5 pb-16 pt-safe md:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="pt-10 md:pt-16">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted">ALL LIVING</p>
          <h1 className="mt-3 max-w-3xl text-[38px] leading-[1.02] md:text-[58px]">La confianza también forma parte de la estancia.</h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-7 text-text-2 md:text-[18px]">
            All Living coordina propiedad, disponibilidad, cobro, soporte y reubicación para reducir la fricción entre huésped y propietario.
          </p>
        </header>

        <section className="mt-10 grid gap-3 md:grid-cols-2">
          {blocks.map(({ href, Icon, title, body }) => (
            <Link key={title} href={href} className="tapable-card group rounded-[24px] bg-surface p-5 hairline md:p-6">
              <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-green-900"><Icon size={20} /></span>
              <h2 className="mt-5 text-[22px]">{title}</h2>
              <p className="mt-2 text-[14px] leading-6 text-text-2">{body}</p>
              <span className="mt-5 inline-flex text-[13px] font-medium text-green-900">Conocer cómo funciona →</span>
            </Link>
          ))}
        </section>

        <section className="mt-12 overflow-hidden rounded-[28px] bg-[#dff5f7] p-6 md:p-9">
          <div className="grid gap-7 md:grid-cols-[1fr_.8fr] md:items-end">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#17677b]">Por qué podemos respaldar</p>
              <h2 className="mt-3 text-[30px] leading-tight text-[#07394b] md:text-[40px]">No dependemos de una sola fuente de inventario.</h2>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#235b69]">
                All Living opera con inventario propio y administrado, semanas liberadas de propiedades fractional del ecosistema V&LIVING y alojamientos de partners verificados. Esa red permite formar un Replacement Pool para contingencias.
              </p>
            </div>
            <div className="rounded-[22px] bg-white/65 p-5 backdrop-blur-md">
              <div className="flex items-center gap-3"><MapPin size={20} className="text-[#0b789a]" /><span className="font-medium text-[#07394b]">Inicio: Quintana Roo</span></div>
              <p className="mt-3 text-[13px] leading-6 text-[#356875]">Cancún · Playa del Carmen · Tulum. La cobertura se amplía sólo cuando existe capacidad operativa suficiente.</p>
            </div>
          </div>
        </section>

        <p className="mt-10 max-w-3xl text-[12px] leading-5 text-muted">
          La Garantía All Living no es un seguro. Cobertura, exclusiones, límites y disponibilidad se rigen por los términos aplicables a cada reserva. Eventos generales de fuerza mayor —como evacuaciones por huracán, cierres de destino o actos de autoridad— pueden quedar excluidos de la obligación de reubicación.
        </p>
      </div>
    </main>
  );
}
