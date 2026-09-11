"use client";
import { cn } from "./cn";
import { Mobius3D } from "./mobius-3d";
export function Mark({size=28,className,interactive=false,motion=true}:{size?:number;className?:string;onDark?:boolean;interactive?:boolean;motion?:boolean}){
 return <span className={cn("inline-grid shrink-0 place-items-center",className)} style={{width:size,height:size}} aria-hidden><Mobius3D compact={size<80} interactive={interactive&&motion} className="h-full w-full"/></span>;
}
