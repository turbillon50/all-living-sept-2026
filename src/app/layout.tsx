import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { esMX } from "@clerk/localizations";
import { Providers } from "./providers";
import { RegisterSW } from "@/ui/register-sw";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "ALL LIVING", template: "%s · ALL LIVING" },
  description: "Stay · Enjoy · Belong. Más que propiedades, experiencias de vida.",
  applicationName: "ALL LIVING",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "ALL LIVING" },
  formatDetection: { telephone: false },
  icons: { icon: "/icons/icon.svg", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      localization={esMX}
      appearance={{
        variables: {
          colorPrimary: "#0f3d3a",
          colorBackground: "#fffdf9",
          colorForeground: "#1f1f1d",
          borderRadius: "12px",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        },
      }}
    >
      <html lang="es-MX" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
        <body>
          <Providers>{children}</Providers>
          <RegisterSW />
        </body>
      </html>
    </ClerkProvider>
  );
}
