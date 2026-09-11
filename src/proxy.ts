import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Rutas que exigen sesión. Todo lo demás (marketing, auth, invitaciones, offline, health, 404) es público.
 * Los layouts de (app) y (onboarding) vuelven a verificar la sesión: esto es defensa en profundidad, no la única puerta.
 */
const isProtected = createRouteMatcher([
  "/home(.*)",
  "/onboarding(.*)",
  "/stays(.*)",
  "/weeks(.*)",
  "/properties(.*)",
  "/fractions(.*)",
  "/explore(.*)",
  "/services(.*)",
  "/providers(.*)",
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
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
