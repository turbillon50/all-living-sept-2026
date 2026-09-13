"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mark } from "./mark";
import { Home, Compass, Briefcase, Wrench, Sparkles } from "./icons";
import type { Role } from "@/core/roles";

type World={role:Role;verb:string;sub:string;Icon:typeof Home};
const WORLDS:World[]=[
 {role:"guest",verb:"VIAJAR",sub:"Estancias · vuelos · experiencias",Icon:Compass},
 {role:"owner",verb:"HOSPEDAR",sub:"Propiedades · tiempo · ingresos",Icon:Home},
 {role:"provider",verb:"OFRECER",sub:"Servicios · agenda · negocio",Icon:Briefcase},
 {role:"operator",verb:"OPERAR",sub:"Estancias · incidencias · equipo",Icon:Wrench},
];
export function LivingButton({role,roles,guest=false}:{role:Role;roles:Role[];guest?:boolean}){
 const router=useRouter(), timer=useRef<ReturnType<typeof setTimeout>|null>(null); const [open,setOpen]=useState(false); const [busy,setBusy]=useState(false);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 const start=()=>{timer.current=setTimeout(()=>setOpen(true),420)}; const cancel=()=>{if(timer.current)clearTimeout(timer.current)};
 const tap=()=>{cancel();if(!open)router.push(guest?"/sign-in":"/support")};
 async function choose(next:Role){if(guest){setOpen(false);router.push("/sign-in");return}if(busy)return;setBusy(true);try{const r=await fetch("/api/mode",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({mode:next})});if(r.ok){setOpen(false);router.push(next==="provider"?"/pro":next==="operator"?"/ops":"/home");router.refresh()}else if(r.status===403){router.push(next==="provider"?"/pro/onboarding":"/profile/mode")}}finally{setBusy(false)}}
 const visible=WORLDS.filter(w=>w.role!=="operator"||roles.includes("operator"));
 return <>
  {open?<div className="world-backdrop" onClick={()=>setOpen(false)} aria-hidden/>:null}
  <div className={`world-switcher ${open?"is-open":""}`}>
   {open?<div className="world-panel" role="dialog" aria-modal="true" aria-label="Cambiar mundo"><div className="world-kicker">¿QUÉ QUIERES HACER?</div>{visible.map(({role:r,verb,sub,Icon})=><button key={r} onClick={()=>choose(r)} disabled={busy} className={`world-row ${r===role?"is-current":""}`}><span className="world-icon"><Icon size={21}/></span><span><strong>{verb}</strong><small>{sub}</small></span>{r===role?<i>Ahora</i>:null}</button>)}</div>:null}
   <button type="button" aria-label={open?"Cerrar mundos":"All Living · tocar para asistente, mantener para cambiar mundo"} className="living-button" onPointerDown={start} onPointerUp={tap} onPointerCancel={cancel} onPointerLeave={cancel} onContextMenu={e=>e.preventDefault()}><Mark size={48} interactive/><span className="living-pulse"/><Sparkles size={14} className="living-spark"/></button>
  </div>
 </>
}
