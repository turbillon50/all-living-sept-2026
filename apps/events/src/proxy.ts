import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";
import { eventsAuthReady } from "@/lib/events-auth";

const authenticate = clerkMiddleware({
  authorizedParties: process.env.NODE_ENV === "production" ? ["https://events.alliving.live"] : ["http://localhost:3000", "http://localhost:3001", "https://events.alliving.live"],
});
export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!eventsAuthReady(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, process.env.CLERK_SECRET_KEY, process.env.NODE_ENV === "production")) return NextResponse.next();
  // Browsing stays public. Clerk protects its own account/session operations.
  return authenticate(request, event);
}
export const config = { matcher: ["/app/:path*", "/acceso", "/iniciar-sesion/:path*", "/registro/:path*"] };
