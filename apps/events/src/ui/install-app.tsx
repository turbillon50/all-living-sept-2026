"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
type InstallPrompt = Event & { prompt: () => Promise<{ outcome: string }>; userChoice: Promise<{ outcome: string }> };
export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const path = usePathname(); const dialog = useRef<HTMLDialogElement>(null);
  const [standalone, setStandalone] = useState(false);
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const beforeInstall = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const installed = () => { setPrompt(null); setStandalone(true); };
    setStandalone(window.matchMedia("(display-mode: standalone)").matches);
    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", installed);
    return () => { window.removeEventListener("beforeinstallprompt", beforeInstall); window.removeEventListener("appinstalled", installed); };
  }, []);
  useEffect(() => {
    async function install() {
      if (prompt && !standalone) {
        try { await prompt.prompt(); await prompt.userChoice; setPrompt(null); } catch { dialog.current?.showModal(); }
      } else dialog.current?.showModal();
    }
    window.addEventListener("events:install", install);
    return () => window.removeEventListener("events:install", install);
  }, [prompt, standalone]);
  return <>{prompt && !standalone && !path.startsWith("/app") && path !== "/acceso" && <button className="install-app" onClick={() => window.dispatchEvent(new Event("events:install"))}>Instalar Eventos <span aria-hidden>↗</span></button>}<dialog ref={dialog} className="install-help" aria-labelledby="install-title" onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}><button aria-label="Cerrar instrucciones de instalación" onClick={() => dialog.current?.close()}>×</button><span className="install-help-icon" aria-hidden>↗</span><h2 id="install-title">{standalone ? "Ya estás dentro de la app." : "Tu próxima noche, a un toque."}</h2><p>{standalone ? "ALL LIVING Eventos está abierta en modo aplicación." : "Instala ALL LIVING Eventos desde un navegador compatible para abrirla desde tu pantalla de inicio."}</p>{!standalone && <ol><li><strong>iPhone o iPad</strong><span>Abre este sitio en Safari, toca Compartir y elige “Añadir a pantalla de inicio”.</span></li><li><strong>Android o computadora</strong><span>Abre el menú de Chrome o Edge y elige “Instalar aplicación” o “Añadir a pantalla de inicio”, si aparece disponible.</span></li></ol>}<small>La instalación depende de tu navegador. El descubrimiento real requiere conexión a internet.</small></dialog></>;
}
