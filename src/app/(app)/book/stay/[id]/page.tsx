import { notFound } from "next/navigation";
import { timeInventoryById } from "@/domains/inventory/queries";
import { holdTime } from "@/domains/inventory/actions";
import { Page, Section } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Photo } from "@/ui/photo";
import { Button } from "@/ui/button";
import { Chip } from "@/ui/chip";
import { money, formatRange } from "@/core/format";

function nights(a:string,b:string){return Math.max(1,Math.round((Date.parse(`${b}T12:00:00Z`)-Date.parse(`${a}T12:00:00Z`))/86400000))}
export default async function BookStayPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{checkIn?:string;checkOut?:string;guests?:string;held?:string}>}){
 const {id}=await params; const q=await searchParams; const inv=await timeInventoryById(id); if(!inv)notFound();
 const checkIn=q.checkIn??inv.startDate, checkOut=q.checkOut??inv.endDate, guests=Math.max(1,Number(q.guests??1)); const n=nights(checkIn,checkOut); const nightly=Number(inv.nightlyRate??0); const subtotal=nightly*n; const cleaning=Number(inv.cleaningFee??0); const held=q.held==="1";
 return <Page><TopBar back={`/properties/${inv.property.id}`} title="Tu estancia"/>{inv.property.cover?<Photo src={inv.property.cover.url} alt={inv.property.cover.alt} priority className="mt-2" ratio="3/2" sizes="(max-width:768px) 100vw,672px"/>:null}<header className="mt-5"><div className="flex items-center gap-2"><Chip>{inv.property.destination}</Chip>{inv.guaranteeEligible?<Chip tone="success">Garantía All Living</Chip>:null}</div><h1 className="mt-3 text-[30px] leading-[1.06]">{inv.property.name}</h1><p className="mt-2 text-text-2">{formatRange(checkIn,checkOut)} · {guests} {guests===1?"huésped":"huéspedes"}</p></header>
 <Section title="Resumen"><div className="space-y-3 rounded-[var(--radius-card)] bg-surface hairline p-5 text-sm"><div className="flex justify-between"><span>{n} noches × {money(nightly,inv.currency)}</span><span>{money(subtotal,inv.currency)}</span></div>{cleaning>0?<div className="flex justify-between"><span>Limpieza</span><span>{money(cleaning,inv.currency)}</span></div>:null}<div className="flex justify-between border-t border-line pt-3 text-[16px] font-medium"><span>Subtotal de alojamiento</span><span>{money(subtotal+cleaning,inv.currency)}</span></div><p className="text-[12px] leading-5 text-muted">Impuestos, comisión All Living y total final se mostrarán antes de activar el pago real.</p></div></Section>
 {held?<div className="mt-6 rounded-[22px] bg-[#dff5f7] p-5 text-[#07394b]"><p className="font-medium">Tu tiempo está apartado por 10 minutos.</p><p className="mt-1 text-sm text-[#356875]">El siguiente paso será el checkout real con impuestos, comisión y Stripe Connect. Todavía no se hará ningún cargo.</p></div>:<form action={holdTime} className="mt-6"><input type="hidden" name="inventoryId" value={id}/><input type="hidden" name="checkIn" value={checkIn}/><input type="hidden" name="checkOut" value={checkOut}/><input type="hidden" name="guests" value={guests}/><Button type="submit" size="lg">Apartar 10 minutos</Button><p className="mt-2 text-center text-[12px] text-muted">No se realizará ningún cargo todavía.</p></form>}
 </Page>
}
