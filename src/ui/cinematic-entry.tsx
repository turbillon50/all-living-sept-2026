"use client";
import { useEffect, useState } from "react";

const KEY = "all-living:intro-seen";

export function markCinematicIntroSeen(){
  try{ sessionStorage.setItem(KEY,String(Date.now())); }catch{}
}

export function CinematicEntry({force=false}:{force?:boolean}){
  const [show,setShow]=useState(false); const [ready,setReady]=useState(false); const [leaving,setLeaving]=useState(false);
  useEffect(()=>{
    let seen=0; try{seen=Number(sessionStorage.getItem(KEY)||0)}catch{}
    const recent=Date.now()-seen<90_000;
    if(!force && recent) return;
    const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
    const open=setTimeout(()=>setShow(true),0);
    const t=setTimeout(()=>{setLeaving(true);markCinematicIntroSeen();setTimeout(()=>setShow(false),420)},reduce?900:5000);
    return()=>{clearTimeout(open);clearTimeout(t)};
  },[force]);
  if(!show) return null;
  return <div className={`cinematic-entry-overlay ${ready?"is-ready":""} ${leaving?"is-leaving":""}`} aria-hidden>
    <video className="cinematic-entry-video" autoPlay muted playsInline preload="auto" poster="/brand/all-living-mobius-poster.jpg" onCanPlay={()=>setReady(true)}>
      <source src="/brand/all-living-mobius-splash.webm" type="video/webm"/>
      <source src="/brand/all-living-mobius-splash.mp4" type="video/mp4"/>
    </video>
    <div className="cinematic-vignette"/>
    <div className="cinematic-brand"><div className="cinematic-name">ALL LIVING</div><div className="cinematic-tag">STAY · ENJOY · BELONG</div></div>
    <div className="cinematic-footer">A MORE HUMAN WAY TO STAY</div>
  </div>
}
