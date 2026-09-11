/* ALL LIVING · service worker. Cache prudente: shell, fuentes, fotos demo, itinerario ya visto.
   Nunca cachea API de dinero ni acciones. Sin conexión → /offline. */
const VERSION = "al-v1";
const SHELL = ["/offline", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

function isCacheable(url) {
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith("/api/")) return false;
  if (url.pathname.startsWith("/_next/image")) return true;
  if (url.pathname.startsWith("/_next/static/")) return true;
  if (url.pathname.startsWith("/demo/") || url.pathname.startsWith("/icons/")) return true;
  return false;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Navegaciones: red primero; si falla, última copia de la página (itinerario, estancia) o /offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && (url.pathname.startsWith("/stays") || url.pathname === "/home" || url.pathname === "/pass")) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("/offline"))),
    );
    return;
  }

  if (isCacheable(url)) {
    event.respondWith(
      caches.match(req).then((hit) => {
        const fetching = fetch(req).then((res) => {
          if (res.ok) caches.open(VERSION).then((c) => c.put(req, res.clone()));
          return res;
        }).catch(() => hit);
        return hit || fetching;
      }),
    );
  }
});
