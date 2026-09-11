"use client";
import { Mobius3D } from "./mobius-3d"; import { cn } from "./cn";
export const RING_MESSAGES=["Preparando tu estancia…","Conectando destinos…","Buscando experiencias…","Casi listo…","Preparando algo extraordinario…"];
export function Ring({size=220,message,className,label="Cargando"}:{size?:number;photos?:string[];message?:string;className?:string;interval?:number;label?:string;band?:number}){
 return <div className={cn("premium-loader flex flex-col items-center gap-6",className)} role="status" aria-live="polite" aria-label={label}><div className="premium-mobius-stage" style={{width:size,height:size}}><div className="water-light"/><Mobius3D className="relative z-10 h-full w-full"/></div>{message?<div className="flex flex-col items-center gap-3"><p className="text-[14px] text-text-2 tracking-wide">{message}</p><span className="hairline-short"/></div>:null}</div>
}
