"use client";
import { useEffect, useState } from "react";
type InstallPrompt = Event & { prompt: () => Promise<{ outcome: string }>; userChoice: Promise<{ outcome: string }> };
export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const beforeInstall = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const installed = () => setPrompt(null);
    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", installed);
    return () => { window.removeEventListener("beforeinstallprompt", beforeInstall); window.removeEventListener("appinstalled", installed); };
  }, []);
  if (!prompt) return null;
  return <button className="install-app" onClick={async () => { await prompt.prompt(); await prompt.userChoice; setPrompt(null); }}>Instalar Eventos <span aria-hidden>↗</span></button>;
}
