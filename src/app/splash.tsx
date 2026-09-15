"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { markCinematicIntroSeen } from "@/ui/cinematic-entry";
export function Splash({target}:{target:string}){
 const router=useRouter(); const [ready,setReady]=useState(false); const [leaving,setLeaving]=useState(false);
 useEffect(()=>{router.prefetch(target);const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;let done=false;const go=()=>{if(done)return;done=true;setLeaving(true);markCinematicIntroSeen();setTimeout(()=>router.replace(target),260)};const a=setTimeout(go,reduce?700:5000),b=setTimeout(go,reduce?1200:6250);return()=>{clearTimeout(a);clearTimeout(b)}},[router,target]);
 return <main className={`cinematic-splash ${ready?"is-ready":""} ${leaving?"is-leaving":""}`}><div className="cinematic-video-ambient" aria-hidden><video className="cinematic-video cinematic-video-blur" autoPlay muted playsInline preload="metadata"><source src="/brand/all-living-mobius-splash.webm" type="video/webm"/></video></div><video className="cinematic-video cinematic-video-main" autoPlay muted playsInline preload="auto" poster="/brand/all-living-mobius-poster.jpg" onCanPlay={()=>setReady(true)} aria-hidden><source src="/brand/all-living-mobius-splash.webm" type="video/webm"/><source src="/brand/all-living-mobius-splash.mp4" type="video/mp4"/></video><div className="cinematic-vignette" aria-hidden/><div className="cinematic-brand"><div className="cinematic-name">ALL LIVING</div><div className="cinematic-tag">STAY · ENJOY · BELONG</div></div><div className="cinematic-footer">A MORE HUMAN WAY TO STAY</div></main>
}
