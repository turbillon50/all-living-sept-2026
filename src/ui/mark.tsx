"use client";
import { cn } from "./cn";
/** Master mark derived from the approved cinematic Möbius, never synthetic geometry. */
export function Mark({size=28,className,interactive=false,motion=true}:{size?:number;className?:string;onDark?:boolean;interactive?:boolean;motion?:boolean}){
 return <span className={cn("master-mark inline-grid shrink-0 place-items-center overflow-hidden rounded-full",interactive&&"is-interactive",motion&&"is-alive",className)} style={{width:size,height:size}} aria-hidden><span className="master-mark-image" /></span>;
}
