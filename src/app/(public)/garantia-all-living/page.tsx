import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, BadgeCheck, LifeBuoy, MapPin } from "@/ui/icons";

export const metadata: Metadata = { title: "Garantía All Living", description: "Qué ocurre si tu alojamiento confirmado no puede recibirte." };

export default function GuaranteePage() {
  return (
    <main className="min-h-dvh bg-bg px-5 pb-16 pt-safe md:px-8">
      <article className="mx-auto max-w-3xl pt-10 md:pt-16">
        <Link href="/confianza" className="text-sm text-text-2">← Centro de Confianza</Link>
        <div className="mt-7 flex size-14 items-center justify-center rounded-full bg-accent-soft text-green-900"><ShieldCheck size={26} /></div>
        <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.3em] text-muted">GARANTÍA ALL LIVING</p>
        <h1 className="mt-3 text-[40px] leading-[1.02] md:text-[60px]">Tu estancia no termina en una confirmación.</h1>
        <p className="mt-5 text-[18px] leading-8 text-text-2">Si un alojamiento confirmado queda indisponible por una incidencia operativa cubierta, All Living activa su protocolo de reubicación.</p>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {[['1', 'Validamos', 'Confirmamos la incidencia y la imposibilidad real de prestar el alojamiento.'], ['2', 'Reubicamos', 'Buscamos una opción de categoría equivalente o superior, priorizando la zona originalmente elegida.'], ['3', 'Acompañamos', 'Coordinamos el cambio y soporte hasta restablecer tu estancia.']].map(([n,t,b]) => <section key={n} className="rounded-[22px] bg-surface p-5 hairline"><span className="text-[11px] tracking-[.2em] text-muted">0{n}</span><h2 className="mt-3 text-[20px]">{t}</h2><p className="mt-2 text-[13px] leading-6 text-text-2">{b}</p></section>)}
        </div>

        <section className="mt-10 rounded-[24px] bg-[#dff5f7] p-6 md:p-8">
          <div className="flex items-center gap-3 text-[#07394b]"><BadgeCheck size={22}/><h2 className="text-[22px]">Qué puede activar la garantía</h2></div>
          <ul className="mt-5 space-y-3 text-[14px] leading-6 text-[#235b69]">
            <li>• Cancelación unilateral o incumplimiento del alojamiento confirmado.</li>
            <li>• Doble reserva o conflicto de inventario confirmado.</li>
            <li>• Alojamiento materialmente inhabitable o acceso imposible por una causa atribuible a la operación.</li>
            <li>• Otra indisponibilidad cubierta conforme a los términos de la reserva.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-[24px]">Fuerza mayor</h2>
          <p className="mt-3 text-[14px] leading-7 text-text-2">Huracanes con evacuación o cierre general del destino, terremotos, actos de autoridad, conflictos, emergencias generales y otros eventos inevitables pueden quedar excluidos de la obligación de reubicación. En esos casos All Living mantiene asistencia operativa y gestiona las alternativas, cambios o devoluciones que correspondan según la reserva y la ley.</p>
        </section>

        <section className="mt-10 grid gap-3 md:grid-cols-2">
          <div className="rounded-[22px] bg-surface p-5 hairline"><MapPin size={20} className="text-green-900"/><h2 className="mt-4 text-[20px]">Replacement Pool</h2><p className="mt-2 text-[13px] leading-6 text-text-2">Inventario administrado, fractional liberado y partners verificados forman la red de alternativas disponible para reubicación.</p></div>
          <div className="rounded-[22px] bg-surface p-5 hairline"><LifeBuoy size={20} className="text-green-900"/><h2 className="mt-4 text-[20px]">No es un seguro</h2><p className="mt-2 text-[13px] leading-6 text-text-2">Es una garantía operativa de All Living sujeta a disponibilidad, límites y términos de la reserva. No sustituye una póliza de seguros.</p></div>
        </section>

        <p className="mt-10 text-[12px] leading-5 text-muted">Este resumen explica la experiencia de producto. Los términos contractuales aplicables a una reserva prevalecen sobre este resumen.</p>
      </article>
    </main>
  );
}
