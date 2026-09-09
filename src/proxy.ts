import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/** Rutas públicas: todo lo demás exige sesión. */
const isPublic = createRouteMatcher([
  "/",
  "/welcome(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/i/(.*)",
  "/offline",
  "/maintenance",
  "/api/health",
  "/api/webhooks/(.*)",
  "/manifest.webmanifest",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublic(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
