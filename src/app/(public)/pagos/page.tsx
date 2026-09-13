import type { Metadata } from "next";
import Link from "next/link";
import { Wallet, BadgeCheck, ShieldCheck } from "@/ui/icons";

export const metadata: Metadata = { title: "Cómo funcionan los pagos", description: "Arquitectura de cobro y comisión de All Living." };

export default function PaymentsExplainer() {
  return (
    <main className="min-h-dvh bg-bg px-5 pb-16 pt-safe md:px-8">
      <article className="mx-auto max-w-3xl pt-10 md:pt-16">
        <Link href="/confianza" className="text-sm text-text-2">← Centro de Confianza</Link>
        <div className="mt-7 flex size-14 items-center justify-center rounded-full bg-accent-soft text-green-900"><Wallet size={26}/></div>
        <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.3em] text-muted">PAGOS ALL LIVING</p>
        <h1 className="mt-3 text-[40px] leading-[1.02] md:text-[60px]">Tu propiedad. Tu dinero. Nuestra operación.</h1>
        <p className="mt-5 text-[18px] leading-8 text-text-2">La arquitectura prevista usa Stripe Connect para separar el cobro del propietario de la comisión de All Living y reducir la custodia innecesaria de fondos por la plataforma.</p>

        <section className="mt-10 rounded-[26px] bg-surface p-6 hairline md:p-8">
          <div className="grid gap-5 md:grid-cols-3">
            {[['Huésped', 'Confirma y paga la reserva mediante el checkout autorizado.'], ['Propietario', 'El cargo del alojamiento se atribuye a su cuenta conectada, sujeto a las reglas del proveedor de pagos.'], ['All Living', 'Recibe su comisión de plataforma de forma separada como application fee cuando el modelo aplicable lo permite.']].map(([t,b],i)=><div key={t}><span className="text-[11px] tracking-[.2em] text-muted">0{i+1}</span><h2 className="mt-3 text-[20px]">{t}</h2><p className="mt-2 text-[13px] leading-6 text-text-2">{b}</p></div>)}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[24px]">Qué significa en la práctica</h2>
          <div className="mt-4 space-y-3">
            <div className="flex gap-3 rounded-[20px] bg-surface p-4 hairline"><BadgeCheck size={20} className="mt-0.5 shrink-0 text-green-900"/><p className="text-[14px] leading-6 text-text-2"><b className="text-text">All Living no debe funcionar como una cuenta bancaria.</b> Buscamos que el dinero del alojamiento quede correctamente atribuido al propietario y que la plataforma cobre únicamente lo que le corresponde.</p></div>
            <div className="flex gap-3 rounded-[20px] bg-surface p-4 hairline"><ShieldCheck size={20} className="mt-0.5 shrink-0 text-green-900"/><p className="text-[14px] leading-6 text-text-2"><b className="text-text">Antes de cobrar se revalida inventario.</b> La reserva utiliza un soft lock temporal y sólo se confirma cuando la disponibilidad sigue siendo válida.</p></div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[24px]">Reservas anticipadas y cancelaciones</h2>
          <p className="mt-3 text-[14px] leading-7 text-text-2">La política concreta puede variar por propiedad. Para reservas lejanas All Living podrá usar pagos programados o anticipos claramente identificados, evitando mantener fondos innecesariamente durante periodos largos. Las condiciones de cancelación, reembolso, impuestos, comisiones y total se muestran antes de confirmar.</p>
        </section>

        <p className="mt-10 text-[12px] leading-5 text-muted">Stripe Connect es la arquitectura de pagos prevista para alojamientos. Su disponibilidad y configuración final dependen de la activación del proveedor, KYC de la cuenta conectada y requisitos fiscales aplicables. All Living no presenta como activo un método de pago que aún no esté habilitado.</p>
      </article>
    </main>
  );
}
