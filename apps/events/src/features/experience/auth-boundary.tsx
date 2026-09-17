import { ClerkProvider } from "@clerk/nextjs";
import { esMX } from "@clerk/localizations";
import { eventsAuthReady } from "@/lib/events-auth";
import { EventsAccountProvider } from "./account-context";

export function EventsAuthBoundary({ children }: { children: React.ReactNode }) {
  const enabled = eventsAuthReady(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, process.env.CLERK_SECRET_KEY);
  const content = <EventsAccountProvider enabled={enabled}>{children}</EventsAccountProvider>;
  if (!enabled) return content;
  return <ClerkProvider localization={esMX} signInUrl="/iniciar-sesion" signUpUrl="/registro" signInFallbackRedirectUrl="/app" signUpFallbackRedirectUrl="/app" allowedRedirectOrigins={["https://events.alliving.live"]} appearance={{ variables: { colorPrimary: "#087f8c", colorForeground: "#183c43", colorBackground: "#ffffff", colorInput: "#f6fafb", colorInputForeground: "#183c43", borderRadius: "12px", fontFamily: "var(--font-inter), sans-serif" }, options: { termsPageUrl: "/terminos", privacyPageUrl: "/privacidad", helpPageUrl: "/responsable" }, elements: { cardBox: { boxShadow: "none", width: "100%" }, card: { boxShadow: "none", border: "1px solid #e4eef0" }, formButtonPrimary: { minHeight: "46px", textTransform: "none", fontWeight: 600 }, footerActionLink: { color: "#087f8c" } } }}>{content}</ClerkProvider>;
}
