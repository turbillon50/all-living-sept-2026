import type { Metadata } from "next";
import { Page } from "@/ui/page";
import { TravelTabs } from "@/ui/travel-tabs";
import { HeroHeader } from "@/ui/primitives";
import { ExperienceSearch } from "@/domains/experiences/experience-search";

// Viator/Tripadvisor ratings must not be indexed by search engines.
export const metadata: Metadata = { title: "Tours y experiencias | All Living", robots: { index: false, follow: true } };

export default function ToursPage() {
  return <Page wide className="md:pb-28">
    <TravelTabs current="experiences" />
    <HeroHeader src="/demo/cenote.webp" alt="Cenote en la Riviera Maya" eyebrow="ALL LIVING · EXPERIENCIAS" title={<>Los mejores días<br />se viven afuera.</>} subtitle="Cenotes, mar y lugares que se quedan contigo. Encuentra tu próxima experiencia en el Caribe." height="min-h-[350px] md:min-h-[400px]" />
    <ExperienceSearch />
  </Page>;
}
