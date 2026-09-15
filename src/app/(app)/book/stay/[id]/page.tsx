import { notFound } from "next/navigation";
import { timeInventoryById } from "@/domains/inventory/queries";
import { holdTime } from "@/domains/inventory/actions";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Photo } from "@/ui/photo";
import { Button } from "@/ui/button";
import { Chip } from "@/ui/chip";
import { ShieldCheck, CalendarCheck, Wallet } from "@/ui/icons";
import { money, formatRange } from "@/core/format";
function nights(a:string,b:string){return Math.max(1,Math.round((Date.parse(`${b}T12:00:00Z`)-Date.parse(`${a}T12:00:00Z`))/86400000))}
export default async function BookStayPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{checkIn?:string;checkOut?:string;guests?:string;held?:string}>}){
 const {id}=await params; const q=await searchParams; const inv=await timeInventoryById(id); if(!inv)notFound();
 const checkIn=q.checkIn??inv.startDate, checkOut=q.checkOut??inv.endDate, guests=Math.max(1,Number(q.guests??1)); const n=nights(checkIn,checkOut); const nightly=Number(inv.nightlyRate??0); const subtotal=nightly*n; const cleaning=Number(inv.cleaningFee??0); const held=q.held==="1";
 return <Page wide className="checkout-page"><TopBar back={`/properties/${inv.property.id}`} title="Tu reserva"/>
  <div className="checkout-layout">
   <div className="checkout-story">
    {inv.property.cover?<Photo src={inv.property.cover.url} alt={inv.property.cover.alt} priority className="checkout-cover" ratio="16/10" sizes="(max-width:768px) 100vw,58vw"/>:null}
    <div className="mt-5 flex flex-wrap items-center gap-2"><Chip>{inv.property.destination}</Chip>{inv.guaranteeEligible?<Chip tone="success">Garantía All Living</Chip>:null}</div>
    <h1 className="mt-3 text-[34px] leading-[1.02] md:text-[50px]">{inv.property.name}</h1>
    <p className="mt-2 text-[15px] text-text-2">{formatRange(checkIn,checkOut)} · {guests} {guests===1?"huésped":"huéspedes"}</p>
    <div className="checkout-trust-grid">
      <div><CalendarCheck size={21}/><span><strong>Tiempo verificado</strong><small>{n} {n===1?"noche":"noches"} seleccionadas</small></span></div>
      <div><ShieldCheck size={21}/><span><strong>Protección visible</strong><small>{inv.guaranteeEligible?"Esta estancia es elegible":"Consulta condiciones antes de confirmar"}</small></span></div>
      <div><Wallet size={21}/><span><strong>Sin cargos ocultos</strong><small>El total final aparece antes del pago</small></span></div>
    </div>
   </div>
   <aside className="checkout-summary">
    <p className="checkout-kicker">RESUMEN</p><h2>Tu estancia</h2>
    <div className="checkout-dates"><span><small>Llegada</small><strong>{checkIn}</strong></span><span><small>Salida</small><strong>{checkOut}</strong></span></div>
    <div className="checkout-lines"><div><span>{n} noches × {money(nightly,inv.currency)}</span><strong>{money(subtotal,inv.currency)}</strong></div>{cleaning>0?<div><span>Limpieza</span><strong>{money(cleaning,inv.currency)}</strong></div>:null}<div className="is-total"><span>Subtotal alojamiento</span><strong>{money(subtotal+cleaning,inv.currency)}</strong></div></div>
    <p className="checkout-note">Impuestos y comisión All Living se mostrarán antes de activar cualquier pago real.</p>
    {held?<div className="checkout-held"><ShieldCheck size={21}/><span><strong>Tu tiempo está apartado.</strong><small>Tienes 10 minutos para continuar. Todavía no se ha realizado ningún cargo.</small></span></div>:<form action={holdTime} className="mt-5"><input type="hidden" name="inventoryId" value={id}/><input type="hidden" name="checkIn" value={checkIn}/><input type="hidden" name="checkOut" value={checkOut}/><input type="hidden" name="guests" value={guests}/><Button type="submit" size="lg" className="checkout-cta">Apartar 10 minutos</Button><p className="mt-2 text-center text-[11px] text-muted">Sin cargo por ahora.</p></form>}
   </aside>
  </div>
 </Page>
}
