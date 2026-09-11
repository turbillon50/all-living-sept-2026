"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "./cn";

type Props = { className?: string; compact?: boolean; interactive?: boolean };

const VS = `
attribute float aU;
varying vec3 vNormalW;
varying vec3 vWorld;
varying float vU;
uniform float uTime;
void main(){
  vec3 p=position;
  float wave=sin(aU*6.2831853*2.0+uTime*.38)*.018 + sin(aU*6.2831853*3.0-uTime*.21)*.008;
  p += normal*wave;
  vec4 w=modelMatrix*vec4(p,1.0);
  vWorld=w.xyz;
  vNormalW=normalize(mat3(modelMatrix)*normal);
  vU=aU;
  gl_Position=projectionMatrix*viewMatrix*w;
}`;

const FS = `
precision highp float;
varying vec3 vNormalW;
varying vec3 vWorld;
varying float vU;
uniform float uTime;
uniform vec3 cameraPosition;
void main(){
  vec3 N=normalize(vNormalW);
  vec3 V=normalize(cameraPosition-vWorld);
  float fres=pow(1.0-max(dot(N,V),0.0),2.45);
  vec3 light=normalize(vec3(-.35,.8,.6));
  float diff=.45+.55*max(dot(N,light),0.0);
  float caust=.5+.5*sin(vU*43.0 + uTime*.75 + sin(vU*19.0-uTime*.31)*2.4);
  caust=pow(caust,7.0);
  float glint=pow(max(dot(reflect(-light,N),V),0.0),48.0);
  vec3 aqua=vec3(.09,.80,.86);
  vec3 ocean=vec3(.015,.27,.47);
  vec3 ice=vec3(.72,.98,1.0);
  vec3 col=mix(ocean,aqua,diff*.68+.18);
  col=mix(col,ice,fres*.78);
  col += caust*vec3(.20,.68,.72)*.38 + glint*vec3(1.0,.98,.9)*1.15;
  float alpha=.86+fres*.12;
  gl_FragColor=vec4(col,alpha);
}`;

export function Mobius3D({ className, compact=false, interactive=true }: Props){
  const host=useRef<HTMLDivElement>(null);
  const [fallback,setFallback]=useState(false);
  useEffect(()=>{
    const el=host.current; if(!el) return;
    let disposed=false, raf=0, cleanup=()=>{};
    const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
    (async()=>{
      try{
        const THREE=await import("three"); if(disposed) return;
        const scene=new THREE.Scene();
        const camera=new THREE.PerspectiveCamera(34,1,.1,100); camera.position.set(0,0,4.45);
        const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"high-performance"});
        renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.outputColorSpace=THREE.SRGBColorSpace;
        el.appendChild(renderer.domElement); renderer.domElement.setAttribute("aria-hidden","true");
        const segU=compact?120:220, segV=compact?18:32;
        const pos:number[]=[], uv:number[]=[], idx:number[]=[];
        const width=.62;
        for(let i=0;i<=segU;i++){
          const u=i/segU*Math.PI*2, cu=Math.cos(u), su=Math.sin(u), ch=Math.cos(u/2), sh=Math.sin(u/2);
          for(let j=0;j<=segV;j++){
            const t=(j/segV-.5)*width;
            const x=(1+t*ch)*cu, y=(1+t*ch)*su, z=t*sh;
            pos.push(x,y,z); uv.push(i/segU,j/segV);
          }
        }
        for(let i=0;i<segU;i++) for(let j=0;j<segV;j++){
          const a=i*(segV+1)+j,b=(i+1)*(segV+1)+j,c=b+1,d=a+1; idx.push(a,b,d,b,c,d);
        }
        const g=new THREE.BufferGeometry(); g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3)); g.setAttribute("aU",new THREE.Float32BufferAttribute(uv.filter((_,k)=>k%2===0),1)); g.setIndex(idx); g.computeVertexNormals();
        const mat=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:FS,transparent:true,side:THREE.DoubleSide,depthWrite:false,uniforms:{uTime:{value:0}}});
        const mesh=new THREE.Mesh(g,mat); mesh.rotation.x=-.72; mesh.rotation.z=.16; scene.add(mesh);
        const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.18,64),new THREE.MeshBasicMaterial({color:0x087f9d,transparent:true,opacity:.055,depthWrite:false})); shadow.scale.set(1.5,.55,1); shadow.position.set(0,-.72,-.7); scene.add(shadow);
        let tx=0,ty=0,px=0,py=0;
        const pointer=(e:PointerEvent)=>{if(!interactive)return; const r=el.getBoundingClientRect(); tx=((e.clientX-r.left)/r.width-.5)*.34; ty=((e.clientY-r.top)/r.height-.5)*.22};
        const leave=()=>{tx=ty=0}; el.addEventListener("pointermove",pointer); el.addEventListener("pointerleave",leave);
        const resize=()=>{const r=el.getBoundingClientRect(); const w=Math.max(1,r.width),h=Math.max(1,r.height); renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix()};
        const ro=new ResizeObserver(resize); ro.observe(el); resize();
        const clock=new THREE.Clock();
        const tick=()=>{if(disposed)return; const t=clock.getElapsedTime(); mat.uniforms.uTime!.value=t; px+=(tx-px)*.045; py+=(ty-py)*.045; if(!reduced){mesh.rotation.y=t*.105+px; mesh.rotation.x=-.72+Math.sin(t*.31)*.055+py; mesh.rotation.z=.16+Math.sin(t*.19)*.035; mesh.position.y=Math.sin(t*.52)*.025;} renderer.render(scene,camera); raf=requestAnimationFrame(tick)}; tick();
        cleanup=()=>{cancelAnimationFrame(raf);ro.disconnect();el.removeEventListener("pointermove",pointer);el.removeEventListener("pointerleave",leave);g.dispose();mat.dispose();renderer.dispose();renderer.domElement.remove()};
      }catch{setFallback(true)}
    })();
    return()=>{disposed=true;cleanup()};
  },[compact,interactive]);
  return <div ref={host} className={cn("mobius3d",compact&&"is-compact",className)}>{fallback?<div className="mobius3d-fallback"/>:null}</div>;
}
