import type { Metadata } from "next";

const impactVerification = process.env.IMPACT_SITE_VERIFICATION;

export const metadata: Metadata = {
  title: "Eventos en Quintana Roo",
  description: "Descubre eventos reales en Cancún, Playa del Carmen y Tulum y compra tus boletos directamente en Ticketmaster.",
  alternates: { canonical: "https://events.alliving.live" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://events.alliving.live",
    siteName: "All Living Eventos",
    title: "Eventos en Quintana Roo",
    description: "Cancún, Playa del Carmen y Tulum. Catálogo consultado en vivo desde Ticketmaster.",
  },
  // Impact: al recibir el código sólo hay que definir IMPACT_SITE_VERIFICATION
  // en Vercel; Next generará <meta name="impact-site-verification" ...>.
  other: impactVerification
    ? { "impact-site-verification": impactVerification }
    : {},
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
