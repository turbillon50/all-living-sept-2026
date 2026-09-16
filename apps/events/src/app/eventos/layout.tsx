import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Eventos en Quintana Roo",
  alternates: { canonical: "https://events.alliving.live/eventos" },
  robots: { index: true, follow: true },
};
export default function EventsLayout({ children }: { children: React.ReactNode }) { return children; }
