import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

const EVENTS_HOSTS = new Set(["events.alliving.live", "events.localhost"]);

function isEventsHost(host: string | null) {
  return EVENTS_HOSTS.has((host ?? "").split(":")[0]?.toLowerCase() ?? "");
}

/**
 * Explorar, el detalle de una propiedad, servicios y proveedores son PÚBLICOS: se navegan sin cuenta,
 * como en cualquier marketplace de hospedaje. La sesión se pide al operar (reservar,
 * liberar semana, publicar), no al mirar. `/properties` a secas es "mis propiedades"
 * y sigue siendo privada: lo público es el catálogo (/explore) y la ficha (/properties/:id). La dirección exacta y los datos del titular
 * nunca salen en la vista pública.
 *
 * Rutas que exigen sesión. Todo lo demás (marketing, auth, invitaciones, offline, health, 404) es público.
 * Los layouts de (app) y (onboarding) vuelven a verificar la sesión: esto es defensa en profundidad, no la única puerta.
 */
const isProtected = createRouteMatcher([
  "/home(.*)",
  "/onboarding(.*)",
  "/stays(.*)",
  "/weeks(.*)",
  "/fractions(.*)",
  "/book/(.*)",
  "/bookings(.*)",
  "/pass(.*)",
  "/notifications(.*)",
  "/income(.*)",
  "/support(.*)",
  "/incidents(.*)",
  "/profile(.*)",
  // OJO: "/pro(.*)" capturaba también /properties y /profile. Anclado a segmento.
  "/pro",
  "/pro/(.*)",
  "/properties",
  "/ops(.*)",
  "/admin(.*)",
]);

const allLivingMiddleware = clerkMiddleware(async (auth, req) => {
  // auth.protect() sin opciones responde 404 a quien no trae sesión: un link compartido
  // moría en "Este lugar no existe". Mandamos a /sign-in y Clerk regresa a la ruta pedida.
  if (isProtected(req)) {
    const signIn = new URL("/sign-in", req.url).toString();
    await auth.protect({ unauthenticatedUrl: signIn, unauthorizedUrl: signIn });
  }
  // Nada más: devolver una respuesta propia aquí anula el handshake de Clerk.
});

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  if (isEventsHost(req.headers.get("host"))) {
    const pathname = req.nextUrl.pathname;

    // El subdominio de afiliación es un producto aislado y no inicializa Clerk.
    // Sólo expone su página de eventos y los recursos técnicos indispensables.
    if (pathname.startsWith("/api/ticketmaster") || pathname.startsWith("/eventos")) {
      return NextResponse.next();
    }

    const eventsUrl = req.nextUrl.clone();
    eventsUrl.pathname = "/eventos";
    return NextResponse.redirect(eventsUrl);
  }

  return allLivingMiddleware(req, event);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
