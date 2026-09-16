import { ExperienceProvider } from "@/features/experience/provider";
import { EventsAuthBoundary } from "@/features/experience/auth-boundary";
export default function ExperienceLayout({ children }: { children: React.ReactNode }) { return <EventsAuthBoundary><ExperienceProvider>{children}</ExperienceProvider></EventsAuthBoundary>; }
