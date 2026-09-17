import type { Metadata, Viewport } from "next";
import { InstallApp } from "@/ui/install-app";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "ALL LIVING · Experiencias", template: "%s · ALL LIVING" },
  description: "Un mundo de experiencias para descubrir. Explora el catálogo real de Viator con All Living.",
  applicationName: "All Living Experiencias", manifest: "/manifest.webmanifest", robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "AL Experiencias", statusBarStyle: "default" },
  icons: { icon: "/icons/favicon-32.png", apple: "/icons/apple-touch-icon.png" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 5, themeColor: "#ffffff", viewportFit: "cover" };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="es-MX"><body>{children}<InstallApp /></body></html>; }
