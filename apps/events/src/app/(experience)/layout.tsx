import { ExperienceProvider } from "@/features/experience/provider";
export default function ExperienceLayout({ children }: { children: React.ReactNode }) { return <ExperienceProvider>{children}</ExperienceProvider>; }
