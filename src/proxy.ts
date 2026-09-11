import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Explorar, propiedades, servicios y proveedores son PÚBLICOS: se navegan sin cuenta,
 * como en cualquier marketplace de hospedaje. La sesión se pide al operar (reservar,
 * liberar semana, publicar), no al mirar. La dirección exacta y los datos del titular
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
  "/book(.*)",
  "/bookings(.*)",
  "/pass(.*)",
  "/notifications(.*)",
  "/income(.*)",
  "/support(.*)",
  "/incidents(.*)",
  "/profile(.*)",
  "/pro(.*)",
  "/ops(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) await auth.protect();
  // La ruta viaja al layout para que decida cascarón de miembro o de visitante.
  const headers = new Headers(req.headers);
  headers.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
