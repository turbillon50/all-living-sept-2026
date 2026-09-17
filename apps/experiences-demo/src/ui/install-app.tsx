"use client";
import { useEffect, useRef, useState } from "react";
type InstallPrompt = Event & { prompt: () => Promise<unknown>; userChoice: Promise<{ outcome: string }> };
export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null), [standalone, setStandalone] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const before = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const installed = () => { setStandalone(true); setPrompt(null); };
    setStandalone(window.matchMedia("(display-mode: standalone)").matches);
    window.addEventListener("beforeinstallprompt", before); window.addEventListener("appinstalled", installed);
    return () => { window.removeEventListener("beforeinstallprompt", before); window.removeEventListener("appinstalled", installed); };
  }, []);
  useEffect(() => {
    const install = async () => { if (prompt && !standalone) { try { await prompt.prompt(); await prompt.userChoice; setPrompt(null); } catch { ref.current?.showModal(); } } else ref.current?.showModal(); };
    window.addEventListener("catalog:install", install); return () => window.removeEventListener("catalog:install", install);
  }, [prompt, standalone]);
  return <dialog ref={ref} className="modal install-modal" aria-label="Instalar All Living Experiencias" onClick={event => { if (event.target === event.currentTarget) ref.current?.close(); }}><button className="install-close" aria-label="Cerrar instalación" onClick={() => ref.current?.close()}>×</button><h2>{standalone ? "Ya estás dentro." : "El mundo, a un toque."}</h2><p>{standalone ? "All Living Experiencias está abierta como aplicación." : "Añade All Living Experiencias a tu pantalla de inicio."}</p>{!standalone && <ol><li><strong>iPhone o iPad</strong><span>En Safari, toca Compartir y elige Añadir a pantalla de inicio.</span></li><li><strong>Android o computadora</strong><span>En un navegador compatible, abre el menú y elige Instalar aplicación o Añadir a pantalla de inicio.</span></li></ol>}<small>La instalación depende del navegador. El catálogo requiere conexión a internet.</small></dialog>;
}
