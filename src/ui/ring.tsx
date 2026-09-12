"use client";
import { Mark } from "./mark"; import { cn } from "./cn";
export const RING_MESSAGES=["Preparando tu estancia…","Conectando destinos…","Buscando experiencias…","Casi listo…","Preparando algo extraordinario…"];
/** Lightweight in-app loading state. Splash uses the cinematic master video. */
export function Ring({size=96,message,className,label="Cargando"}:{size?:number;photos?:string[];message?:string;className?:string;interval?:number;label?:string;band?:number}){return <div className={cn("flex flex-col items-center gap-5",className)} role="status" aria-live="polite" aria-label={label}><Mark size={size} motion/><>{message?<p className="text-[13px] tracking-wide text-text-2">{message}</p>:null}</></div>}
