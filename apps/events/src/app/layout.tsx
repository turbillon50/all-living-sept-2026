import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { InstallApp } from "@/ui/install-app";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["opsz", "SOFT"], display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
export const metadata: Metadata = {
  metadataBase: new URL("https://events.alliving.live"),
  title: { default: "ALL LIVING Eventos · Quintana Roo", template: "%s · ALL LIVING Eventos" },
  description: "Descubre conciertos, deportes y espectáculos en Cancún, Playa del Carmen y Tulum. Tus boletos, directamente en Ticketmaster.",
  applicationName: "ALL LIVING Eventos", manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "AL Eventos", statusBarStyle: "default" },
  icons: { icon: "/icons/favicon-32.png", apple: "/icons/apple-touch-icon.png" },
  openGraph: { type: "website", locale: "es_MX", siteName: "ALL LIVING Eventos", images: [{ url: "/events/live-stage.webp", width: 1800, height: 1200, alt: "La vida suena mejor en vivo" }] },
};
export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1, maximumScale: 5, viewportFit: "cover" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es-MX" className={`${fraunces.variable} ${inter.variable}`}><body>{children}<InstallApp /></body></html>;
}
